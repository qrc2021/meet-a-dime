exports.getSchemas = function(mongoose)
{
    const UsersSchema = new mongoose.Schema({
        Login : {
            type: String,
            required: true
        },
        Password: {
            type: String,
            required: true
        },
        userId: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        }    
    });

    const CardsSchema = new mongoose.Schema({
        Card: {
            type: String,
            required: true
        },    
        UserId: {
            type: String,
            required: true
        }
    });


    const Users = mongoose.model('Users', UsersSchema, 'Users');
    const Cards = mongoose.model('Cards', CardsSchema, 'Cards');

    return {Users:Users, Cards:Cards};


}