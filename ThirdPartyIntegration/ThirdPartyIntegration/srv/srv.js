const cds = require('@sap/cds');


module.exports = async (srv) => {
    
    
    const BupaService = await cds.connect.to('API_BUSINESS_PARTNER');

   
    srv.on('READ', 'Customer', async req => {
        
       
        return BupaService.run(req.query);
    });
}



// module.exports = async function (srv) {

//   // connect to remote OData (your cds.requires should define API_BUSINESS_PARTNER)
//   const s4bpa = await cds.connect.to('API_BUSINESS_PARTNER');

//   // Get a reference to the local Author entity that your service exposes.
//   // This is safer than hardcoding a string namespace that may be wrong.
//   const { Author } = srv.entities; // assumes 'Author' is exposed by this service

//   if (!Author) {
//     srv.log && srv.log.warn('Author entity not found in service entities. Check service cds.');
//   }

//   // --- Custom READ handler for Customer (remote projection) ---
//   // Because Customer is a projection on an external service (persistence.skip),
//   // CAP won't create a default generic handler — so you provide one here.
//   srv.on('READ', 'Customer', (req) => {
//     // simply forward the incoming query to the remote client
//     return s4bpa.run(req.query);
//   });

//   // --- Sync single BusinessPartner into local Author ---
//   srv.on('SyncAuthor', async (req) => {
//     const { BusinessPartnerUUID } = req.data || {};
//     if (!BusinessPartnerUUID) return req.reject(400, 'BusinessPartnerUUID is required');

//     try {
//       // fetch BP from remote (select only fields you want)
//       const bp = await s4bpa.run(
//         SELECT.one.from('new.A_BusinessPartner').columns([
//           'BusinessPartnerUUID',
//           'BusinessPartnerFullName',
//           'GenderCodeName',
//           'BirthDate',
//           'BusinessPartnerName'
//         ]).where({ BusinessPartnerUUID })
//       );

//       if (!bp) return req.reject(404, `BusinessPartner ${BusinessPartnerUUID} not found`);

//       // map to local Author shape
//       const author = {
//         id: bp.BusinessPartnerUUID,
//         BusinessPartnerFullName: bp.BusinessPartnerFullName || null,
//         GenderCodeName: bp.GenderCodeName || null,
//         BirthDate: bp.BirthDate ? String(bp.BirthDate) : null,
//         BusinessPartnerName: bp.BusinessPartnerName || null
//       };

//       // upsert into local Author using transaction
//       const tx = cds.transaction(req);

//       // Use srv.entities.Author (if present) or fall back to FQN
//       const target = Author ? Author : 'ThirdPartyIntegration.srv.external.Author'; // adjust FQN if different

//       const updateRes = await tx.run(
//         UPDATE(target).set(author).where({ id: author.id })
//       );

//       const updatedRows = typeof updateRes === 'number' ? updateRes :
//                            (updateRes && updateRes.count) ? updateRes.count : 0;

//       if (!updatedRows) {
//         await tx.run(INSERT.into(target).entries(author));
//       }

//       return { success: true, author };

//     } catch (err) {
//       req.log && req.log.error && req.log.error(err);
//       return req.reject(502, `Sync failed: ${err.message}`);
//     }
//   });


//   // srv/my-service.js (replace your BulkSyncAuthors handler with this)

// const PAGE_SIZE = 500;      // how many BPs to fetch per remote request
// const INSERT_CHUNK = 200;   // how many rows to try to bulk-insert at once

// module.exports = async function (srv) {
//   const s4bpa = await cds.connect.to('API_BUSINESS_PARTNER');

//   // prefer service-exposed entity reference if present
//   const AuthorEntity = srv.entities && srv.entities.Author
//     ? srv.entities.Author
//     : 'ThirdPartyIntegration.db.Author'; // adjust FQN if needed

//   // keep your READ Customer handler and SyncAuthor handler earlier...
//   srv.on('READ', 'Customer', req => s4bpa.run(req.query));

//   // Robust bulk sync:
//   srv.on('BulkSyncAuthors', async (req) => {
//     const opts = req.data || {};
//     const pageSize = opts.pageSize || PAGE_SIZE;
//     let offset = opts.start || 0;
//     const limit = opts.limit || null; // optional: stop after limit records
//     let totalInserted = 0;
//     let totalUpdated = 0;
//     let page = 0;

//     try {
//       while (true) {
//         page++;
//         // fetch a page - using SELECT.limit/offset for portability
//         let bps = await s4bpa.run(
//           SELECT.from('new.A_BusinessPartner').columns([
//             'BusinessPartnerUUID',
//             'BusinessPartnerFullName',
//             'GenderCodeName',
//             'BirthDate',
//             'BusinessPartnerName'
//           ]).limit(pageSize).offset(offset)
//         );

//         // normalize OData v2 (d.results) and v4 (value)
//         if (bps && bps.d && Array.isArray(bps.d.results)) bps = bps.d.results;
//         else if (bps && bps.value && Array.isArray(bps.value)) bps = bps.value;

//         if (!bps || bps.length === 0) {
//           srv.log && srv.log.info && srv.log.info(`BulkSyncAuthors: finished at page ${page}, offset ${offset}`);
//           break;
//         }

//         // optionally trim if user provided a total limit
//         if (limit && (offset + bps.length) > limit) {
//           bps = bps.slice(0, limit - offset);
//         }

//         // map to local Author entries
//         const entries = bps.map(bp => ({
//           id: bp.BusinessPartnerUUID,
//           BusinessPartnerFullName: bp.BusinessPartnerFullName || null,
//           GenderCodeName: bp.GenderCodeName || null,
//           BirthDate: bp.BirthDate ? String(bp.BirthDate) : null,
//           BusinessPartnerName: bp.BusinessPartnerName || null
//         }));

//         // process in chunks to avoid huge single DB statements
//         for (let i = 0; i < entries.length; i += INSERT_CHUNK) {
//           const chunk = entries.slice(i, i + INSERT_CHUNK);
//           try {
//             const tx = cds.transaction(req);
//             await tx.run(INSERT.into(AuthorEntity).entries(chunk));
//             totalInserted += chunk.length;
//             // no explicit commit required typically; leaving it to cds
//           } catch (insertErr) {
//             // Bulk insert failed -> fallback to per-row upsert
//             srv.log && srv.log.warn && srv.log.warn(`Bulk insert failed for chunk (page ${page}, offset ${offset + i}): ${insertErr.message || insertErr}`);
//             for (const entry of chunk) {
//               try {
//                 const tx = cds.transaction(req);
//                 const updateRes = await tx.run(UPDATE(AuthorEntity).set(entry).where({ id: entry.id }));
//                 const updatedRows = typeof updateRes === 'number' ? updateRes :
//                                      (updateRes && updateRes.count) ? updateRes.count : 0;
//                 if (!updatedRows) {
//                   await tx.run(INSERT.into(AuthorEntity).entries(entry));
//                   totalInserted++;
//                 } else {
//                   totalUpdated++;
//                 }
//               } catch (rowErr) {
//                 // log but continue — you might want to collect failures to return them
//                 srv.log && srv.log.error && srv.log.error(`Upsert failed for id=${entry.id}: ${rowErr.message || rowErr}`);
//               }
//             }
//           }
//         }

//         offset += bps.length;
//         if (limit && offset >= limit) break;
//         // small delay optional to avoid throttling: await new Promise(r => setTimeout(r, 50));
//       }

//       return { inserted: totalInserted, updated: totalUpdated, status: 'done' };
//     } catch (err) {
//       srv.log && srv.log.error && srv.log.error('BulkSyncAuthors fatal error:', err);
//       return req.reject(502, `Bulk sync failed: ${err.message || err}`);
//     }
//   });

// };


// };
