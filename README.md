# heliosRX

 🔥 A reactive front-end ORM layer for the real-time web 🔥
 - Currently supports Vue and Firebase.

 ![./doc/img/helios-rx.png](heliosRX)

 ## Generic API

 This is the generic store, which provides a unified API to our database.

 The goal is to target different platforms with a shared codebase:

 - Babel for Web / Desktop
 - Dart / Flutter for Mobile
 - Node for admin tools and cloud functions

 The generic API includes a description of the database including:

 - Storage paths (refs)
 - Schemata
 - Input validation rules
