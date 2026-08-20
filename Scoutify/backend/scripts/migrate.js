// scripts/migrate.js
const mongoose = require('mongoose');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection;

    // ============================================
    // 1. Update Users Collection
    // ============================================
    console.log('📝 Updating users collection...');
    
    // Add new fields to all users
    const userResult = await db.collection('users').updateMany(
      {},
      {
        $set: {
          isActive: true,
          clubRole: 'Scout',
          scoutRequestStatus: null,
          scoutRequestedClubId: null
        },
        $setOnInsert: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: false }
    );
    console.log(`✅ Updated ${userResult.modifiedCount} users`);

    // Update Club users to have Admin role
    const clubUserResult = await db.collection('users').updateMany(
      { role: 'Club' },
      {
        $set: {
          clubRole: 'Admin'
        }
      }
    );
    console.log(`✅ Updated ${clubUserResult.modifiedCount} Club users to Admin`);

    // ============================================
    // 2. Update Clubs Collection
    // ============================================
    console.log('📝 Updating clubs collection...');
    
    const clubResult = await db.collection('clubs').updateMany(
      {},
      {
        $set: {
          scouts: [],
          isVerified: false,
          transferWindowOpen: true,
          transferWindowStart: null,
          transferWindowEnd: null
        },
        $setOnInsert: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: false }
    );
    console.log(`✅ Updated ${clubResult.modifiedCount} clubs`);

    // Add club creator as scout/admin
    const clubs = await db.collection('clubs').find({}).toArray();
    for (const club of clubs) {
      if (club.userId) {
        await db.collection('clubs').updateOne(
          { _id: club._id },
          { $addToSet: { scouts: club.userId } }
        );
        console.log(`✅ Added club creator ${club.userId} to scouts of ${club.clubName}`);
      }
    }

    // ============================================
    // 3. Update Players Collection
    // ============================================
    console.log('📝 Updating players collection...');
    
    const playerResult = await db.collection('players').updateMany(
      {},
      {
        $set: {
          secondaryPosition: null,
          transferStatus: 'Available',
          visibleToScouts: true,
          joinedClubDate: null,
          contractExpiryDate: null
        },
        $setOnInsert: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: false }
    );
    console.log(`✅ Updated ${playerResult.modifiedCount} players`);

    // If player has clubId, update their status and joined date
    const players = await db.collection('players').find({ clubId: { $ne: null } }).toArray();
    for (const player of players) {
      await db.collection('players').updateOne(
        { _id: player._id },
        {
          $set: {
            transferStatus: 'Not Available',
            joinedClubDate: player.createdAt || new Date()
          }
        }
      );
    }
    console.log(`✅ Updated ${players.length} affiliated players`);

    // ============================================
    // 4. Update Performances Collection
    // ============================================
    console.log('📝 Updating performances collection...');
    
    const performanceResult = await db.collection('performances').updateMany(
      {},
      {
        $set: {
          matchDate: new Date(),
          competition: 'League',
          opponent: '',
          updatedBy: null,
          isEdited: false,
          minutesPlayed: 90
        },
        $setOnInsert: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: false }
    );
    console.log(`✅ Updated ${performanceResult.modifiedCount} performances`);

    // ============================================
    // 5. Update TransferOffers Collection
    // ============================================
    console.log('📝 Updating transfer_offers collection...');
    
    const offerResult = await db.collection('transfer_offers').updateMany(
      {},
      {
        $set: {
          offeredPosition: null,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          respondedAt: null,
          withdrawnAt: null
        },
        $setOnInsert: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: false }
    );
    console.log(`✅ Updated ${offerResult.modifiedCount} transfer offers`);

    // Update offers with offeredPosition based on player position
    const offers = await db.collection('transfer_offers').find({}).toArray();
    for (const offer of offers) {
      if (offer.playerId) {
        const player = await db.collection('players').findOne({ _id: offer.playerId });
        if (player && player.position) {
          await db.collection('transfer_offers').updateOne(
            { _id: offer._id },
            { $set: { offeredPosition: player.position } }
          );
        }
      }
    }

    // ============================================
    // 6. Create ScoutRequests Collection
    // ============================================
    console.log('📝 Creating scout_requests collection...');
    
    const scoutRequestsCollection = db.collection('scout_requests');
    await scoutRequestsCollection.createIndex(
      { scoutId: 1, clubId: 1, status: 1 }, 
      { unique: true }
    );
    console.log('✅ Created scout_requests collection with indexes');

    // ============================================
    // 7. Create TransferHistories Collection
    // ============================================
    console.log('📝 Creating transfer_histories collection...');
    
    const transferHistoryCollection = db.collection('transfer_histories');
    await transferHistoryCollection.createIndex({ playerId: 1, transferDate: -1 });
    await transferHistoryCollection.createIndex({ fromClubId: 1 });
    await transferHistoryCollection.createIndex({ toClubId: 1 });
    console.log('✅ Created transfer_histories collection with indexes');

    // ============================================
    // 8. Migrate Existing Transfers
    // ============================================
    console.log('📝 Migrating existing transfers...');
    
    const acceptedOffers = await db.collection('transfer_offers')
      .find({ status: 'Accepted' })
      .toArray();

    for (const offer of acceptedOffers) {
      // Check if transfer history already exists
      const existing = await db.collection('transfer_histories')
        .findOne({ offerId: offer._id });
      
      if (!existing) {
        // Find player's previous club
        const player = await db.collection('players').findOne({ _id: offer.playerId });
        const fromClubId = player && player.clubId ? player.clubId : null;
        
        await db.collection('transfer_histories').insertOne({
          playerId: offer.playerId,
          fromClubId: fromClubId,
          toClubId: offer.clubId,
          offerId: offer._id,
          transferDate: offer.respondedAt || offer.createdAt || new Date(),
          contractLength: offer.contractLength || 'Unknown',
          initiatedBy: offer.senderId,
          transferType: 'Permanent',
          notes: 'Migrated from existing transfer',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Created transfer history for offer ${offer._id}`);
      }
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();