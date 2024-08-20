const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const fse = require('fs-extra');
const ejs = require('ejs');
const { get } = require('http');
const bodyParser = require('body-parser');



const app = express();

require("dotenv").config();

const {KindeClient, GrantType} = require("@kinde-oss/kinde-nodejs-sdk");
const { isAuthenticated } = require('./middlewares/isAuthenticated');

const options = {
  domain: process.env.KINDE_DOMAIN,
  clientId: process.env.KINDE_CLIENT_ID,
  clientSecret: process.env.KINDE_CLIENT_SECRET,
  redirectUri: process.env.KINDE_REDIRECT_URI,
  logoutRedirectUri: process.env.KINDE_LOGOUT_REDIRECT_URI || '',
  grantType: GrantType.PKCE,
  // scope: 'openid offline profile email'
  // audience: 'https://example.com/api'
};
const kindeClient = new KindeClient(options);

app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Directories
const outputDir = path.join(__dirname, 'output');
const publicDir = path.join(__dirname, 'public');
const viewsDirectory = path.join(__dirname, 'views');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Templates to be rendered
const templates = [
  { template: 'app.ejs', output: 'app.html' },
  { template: 'manifest.ejs', output: 'manifest.json' },
  { template: 'script.ejs', output: 'script.js' },
  { template: 'style.ejs', output: 'style.css' }
];

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.get('/hello', (req, res) => {
  const responseData = { message: 'Hello from the server!' };
  res.json(responseData);
});

app.get('/', async (req, res) => {
  try {
    const isAuthenticated = await kindeClient.isAuthenticated(req);
    if (isAuthenticated) {
      res.redirect('/admin');
    } else {
      res.render('index', {
        title: 'Hey',
        message: 'Hello there! What would you like to do?',
      });
    }
  } catch (error) {
    // Handle errors here
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/login', kindeClient.login(), (req, res) => {
  return res.redirect('/admin');
});

app.get('/register', kindeClient.register(), (req, res) => {
  return res.redirect('/admin');
});

app.get('/createOrg', kindeClient.createOrg(), (req, res) => {
  return res.redirect('/admin');
});

app.get('/helper-functions', isAuthenticated(kindeClient), (req, res) => {
  res.render('helper_functions',{
    user: kindeClient.getUserDetails(req)
  });
});

app.get('/user-detail', isAuthenticated(kindeClient), async (req, res) => {
  const accessToken = await kindeClient.getToken(req);
  res.render('details',{
    user: kindeClient.getUserDetails(req),
    accessToken: accessToken
  });
});

app.get('/get-claim-view',isAuthenticated(kindeClient), (req, res) => {
  const result = kindeClient.getClaim(req, 'given_name', 'id_token');
  res.render('get_claim',{
    user: kindeClient.getUserDetails(req),
    resultGetClaim: JSON.stringify(result)
  })
});

app.get('/get-flag-view',isAuthenticated(kindeClient), (req, res) => {
  const result = kindeClient.getFlag(req, 'theme', {defaultValue: false}, 's');
  res.render('get_flag',{
    user: kindeClient.getUserDetails(req),
    resultGetFlag: JSON.stringify(result),
  })
});

app.get('/get-permissions-view',isAuthenticated(kindeClient), (req, res) => {
  res.render('get_permissions',{
    user: kindeClient.getUserDetails(req),
    resultGetPermissions: JSON.stringify(kindeClient.getPermissions(req))
  })
});

app.get('/get-permission-view',isAuthenticated(kindeClient), (req, res) => {
  res.render('get_permission',{
    user: kindeClient.getUserDetails(req),
  })
});

app.post('/get-permission', isAuthenticated(kindeClient), (req, res) => {
  try {
    const { permission } = req.body;
    const result = kindeClient.getPermission(req, permission);
    if (result) {
      res.render('get_permission',{ user: kindeClient.getUserDetails(req), resultGetPermission: JSON.stringify(result)});
    } 
  } catch(e) {
    res.render('get_permission', { user: kindeClient.getUserDetails(req), errorGetPermission: e.message});
  }  
});

app.get('/get-organization-view',isAuthenticated(kindeClient), (req, res) => {
  res.render('get_organization',{
    user: kindeClient.getUserDetails(req),
    resultGetOrganization: JSON.stringify(kindeClient.getOrganization(req))
  })
});

app.get('/get-user-organization-view',isAuthenticated(kindeClient), (req, res) => {
  res.render('get_user_organizations',{
    user: kindeClient.getUserDetails(req),
    resultGetUserOrganizations: JSON.stringify(kindeClient.getUserOrganizations(req))
  })
});

app.get('/get-token-view',isAuthenticated(kindeClient), async (req, res) => {
  const token = await kindeClient.getToken(req);
  res.render('get_token',{
    user: kindeClient.getUserDetails(req),
    resultGetToken: token
  })
});

/*
app.get('/callback', kindeClient.callback(), async (req, res) => {
  return res.redirect('/admin');
});
*/

app.get('/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.get('/build', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'build.html'));
});

app.get('/dash', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dash.html'));
});

app.get('/embed', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'embed.html'));
});

app.get('/admin', isAuthenticated(kindeClient), (req, res) => {
  res.render('admin', {
    title: 'Admin',
    user: kindeClient.getUserDetails(req),
  });
});

// API endpoint to generate files
app.post('/generate', async (req, res) => {
    try {
        await renderAndGenerateFiles(req.body);
          res.status(200).send('Files generated successfully.');
    } catch (err) {
        res.status(500).send('Error during file generation: ' + err.message);
    }
});

app.get('/reset', async (req, res) => {

    const srcDir = `./reset/`;
    const destDir = `./public/`;
                                    
    try {
      fse.copySync(srcDir, destDir, { overwrite: true })
      console.log('App reset to default successfully.')
      res.setHeader('content-type', 'text/html');
      res.end(
        `<script>window.open('/app', '_parent');</script>`
      );
    } catch (err) {
      console.error(err)
      res.status(500).send('Error during reset to default: ' + err.message);
    }
});

app.get('/refresh', (req, res) => {
  // Send a response with JavaScript code to refresh the page
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.get('/logout-redirect', (req, res) => {
  res.render('logout_redirect', {
    title: 'Logout',
    user: kindeClient.getUserDetails(req),
  });
})

app.get('/logout', (req, res) => {
  res.render('logout', {
    title: 'Logout',
    user: kindeClient.getUserDetails(req),
  });
})

app.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register',
    user: kindeClient.getUserDetails(req),
  });
})


// Function to render and generate files
async function renderAndGenerateFiles(params) {
    try {
        for (const templateInfo of templates) {
            const renderedContent = await ejs.renderFile(
                path.join(viewsDirectory, templateInfo.template),
                params
            );
            fs.writeFileSync(path.join(outputDir, templateInfo.output), renderedContent);

            // Copying files to public directory
            const outputPath = path.join(outputDir, templateInfo.output);
            const publicPath = path.join(publicDir, templateInfo.output);

            if (fs.existsSync(publicPath)) {
                fs.unlinkSync(publicPath);
            }
            fs.copyFileSync(outputPath, publicPath);
        }
    } catch (err) {
        throw new Error('Error during template rendering and file generation: ' + err.message);
    }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
  
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;