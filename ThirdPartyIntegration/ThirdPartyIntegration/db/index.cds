using { API_BUSINESS_PARTNER as new } from '../srv/external/API_BUSINESS_PARTNER';

namespace ThirdPartyIntegration.srv.external;

entity businesspartner as projection on new.A_BusinessPartner{
key BusinessPartnerUUID,
Customer,
BirthDate,
BusinessPartnerFullName,
BusinessPartnerName,
GenderCodeName,
}


entity Author {
    Key id: String;
    Name:String;
      BusinessPartnerFullName:String;
    GenderCodeName:String;
    BirthDate:String;
BusinessPartnerName:String
}

entity Books  {
    key id:String;
    name:String;
    price:String;
    author: Association to Author;
}