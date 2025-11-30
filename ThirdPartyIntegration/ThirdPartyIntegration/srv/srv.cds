// using { ThirdPartyIntegration.srv.external as db } from '../db';
 using { API_BUSINESS_PARTNER as db } from './external/API_BUSINESS_PARTNER';


namespace ThirdPartyIntegration.srv;

service MyService {

    entity Customer as projection on db.A_AddressEmailAddress;
  //   entity books as projection on db.Books;
  //   entity auther as projection on db.Author;

  //    action SyncAuthor(BusinessPartnerUUID: String) returns Boolean;
  // action BulkSyncAuthors() returns Integer;
}