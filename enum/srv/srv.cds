using { my.orders as new} from '../db/schema';

service MyService {
entity billings as projection on new.Billings;
    

}