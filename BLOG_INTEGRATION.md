# Blog Integration Guide for PatientZer0

This guide explains how the external Blogging-Site-main project has been integrated into the PatientZer0 application without modifying the original blog code.

## Overview

The integration uses a proxy approach where:

1. The PatientZer0 server acts as a proxy for the blog server
2. The PatientZer0 client embeds the blog client using an iframe
3. Authentication is passed between the two applications

## How It Works

### Server-side Integration

- The main PatientZer0 server uses `http-proxy-middleware` to forward requests from `/blog-api/*` to the blog server
- Static assets (like images) from the blog are served through `/blog-static/*`
- Both applications maintain their own separate databases and user management

### Client-side Integration

- The Blog page in PatientZer0 has two views:
  1. The original PatientZer0 blog (integrated view)
  2. The embedded Blogging-Site-main blog (embedded view)
- Users can switch between these views using toggle buttons

## Running the Integrated Application

1. Start the PatientZer0 servers and clients:

   ```
   npm run full-dev
   ```

   This command starts:

   - The PatientZer0 server (port 5001)
   - The PatientZer0 client (port 3000)
   - The Blogging-Site-main server (port 8000)

2. The Blogging-Site-main client runs separately on port 3001:
   ```
   cd Blogging-Site-main/client && npm start
   ```

## Technical Details

### Modified Files

1. **PatientZer0 Server**

   - Added proxy middleware in `server/server.js`
   - Added scripts to start all services in `package.json`

2. **PatientZer0 Client**

   - Updated `client/src/pages/Blog.js` to include iframe embedding
   - Enhanced `client/src/pages/Blog.css` with styles for the embedded view

3. **Blogging-Site-main Client**
   - Updated port in `Blogging-Site-main/client/package.json` to use 3001
   - Modified API URL in `Blogging-Site-main/client/src/service/api.js` to use the proxy
   - Updated image URLs in `Blogging-Site-main/server/controller/image-controller.js`

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Check the CORS configuration in `server/server.js`
   - Ensure the proxy middleware is properly configured

2. **Authentication Issues**

   - The integration currently doesn't fully synchronize authentication
   - Users may need to log in separately to the blog

3. **Missing Images**
   - Images should be served through the `/blog-static` endpoint
   - Check the image URL configuration in `Blogging-Site-main/server/controller/image-controller.js`

## Future Improvements

1. Implement unified authentication between PatientZer0 and the blog
2. Add SSO (Single Sign-On) functionality
3. Integrate the blog's user management with PatientZer0's user system
4. Improve the UI integration between the two applications
5. Add content synchronization between the two blogs
