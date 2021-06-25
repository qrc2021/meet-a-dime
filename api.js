var token = require('./createJWT.js');
var bcrypt = require('bcrypt')
var schemas = require('./schemas.js')
exports.setApp = function (app, db, mongoose)
{

    var schema_set = schemas.getSchemas(mongoose);
    var Users = schema_set.Users;
    var Cards = schema_set.Cards;
    // .. more here
    
    app.post('/api/login', async (req, res, next) =>    
    {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error
    
        var error = '';

        const { login, password } = req.body;
        var results = [];
        // console.log(results);
        try
        {
          // const db = client.db();
          // results = await db.collection('Users').find({Login:login,Password:password}).toArray();
          results = await Users.find({ Login: login, Password: password });
        }
        catch(error)
        {
          ret = {error: "Database error"};
          console.log(error);
          return;
        }

        
        var ret = '';
        var id = -1;
        var fn = '';
        var ln = '';

        if( results.length > 0 )
        {
            id = results[0].userId;
            fn = results[0].firstName;
            ln = results[0].lastName;

            try
            {
                // const token = require("./createJWT.js");
                ret = token.createToken(fn, ln, id);
            }
            catch(e)
            {
                ret  = {error:e.message};
            }
        }
        else
        {
            ret = {error: "Login/Password Incorrect"}; 
        }

           
        res.status(200).json(ret);
    });
    
    app.post('/api/register', async (req, res, next) =>    
    {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error
        var error = 'OK';
        const { login, password, id, firstName, lastName} = req.body;
        const newUser = new Users({Login:login,Password:password, userId:id, firstName:firstName, lastName:lastName});
        try{

        // const db = client.db();
        // const results = await db.collection('Users').insertOne(newCard);
          newUser.save();
        }
        catch(err)
        {
            error = err;
        }
        var ret = {error:error};    
        res.status(200).json(ret);
    });
    
    app.post('/api/addcard', async (req, res, next) =>
    {
      // incoming: userId, color
      // outgoing: error
        
      const { userId, card, jwtToken } = req.body;

      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      const newCard = new Cards({Card:card,UserId:userId});
      var error = '';
    
      try
      {
        // const db = client.db();
        // const result = db.collection('Cards').insertOne(newCard);
        newCard.save();
      }
      catch(e)
      {
        error = e.toString();
      }
    
      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      var ret = { error: error, jwtToken: refreshedToken };
      
      res.status(200).json(ret);
    });
    
    app.post('/api/searchcards', async (req, res, next) => 
    {
      // incoming: userId, search
      // outgoing: results[], error
    
      var error = '';
    
      const { userId, search, jwtToken } = req.body;

      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
      
      var _search = search.trim();
      
      // const db = client.db();
      // const results = await db.collection('Cards').find({"Card":{$regex:_search+'.*', $options:'i'}}).toArray();
      const results = await Cards.find({"Card":{$regex:_search+'.*', $options:'i'}});

      var _ret = [];
      for( var i=0; i<results.length; i++ )
      {
        _ret.push( results[i].Card );
      }
      
      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      var ret = { results:_ret, error: error, jwtToken: refreshedToken };
      
      res.status(200).json(ret);
    });

}