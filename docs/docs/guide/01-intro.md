# Introduction

## What is heliosRX?

**heliosRX** is a front-end ORM (Object-Relational Mapping) layer
for reactive real-time web applications using Firebase Realtime Database.
heliosRX allows developers to define `models` based on schema files.

<!--
Firebase Realtime Database is a managed NoSQL database hosted on
the Google Cloud infrastructure, that allows to save and retrieve data from a
JSON-like structure.
-->

While using the Firebase Client API is fine for smaller applications, enforcing
some structure is almost necessary to successfully manage more complex applications.
Ensuring some structure simplifies life a lot and gives you the best of both
the NoSQL and the SQL world.

![heliosRX](./img/helios-rx.png)

heliosRX consists of two parts: A generator that can generate security rules
from schema files, thus creating a data model for the server, and a javascript
ORM library, that creates a nice abstraction to Realtime Database based on the
exact same data model. The basic idea here is: **Describe a model once, reuse
it as much as possible**. Another goal of heliosRX is therefor to target
different platforms with a shared codebase and provide a unified API to
the database for different platforms, such as:

- Babel for Web / Desktop
- Dart / Flutter for Mobile
- Node for admin tools and cloud functions

<!--
The generic API includes a description of the database including:

- Storage paths (refs)
- Schemata
- Input validation rules
-->

While currently heliosRX is build for Vue and Firebase Realtime Database,
other backend integrations might get implemented in the future (e.g. GraphQL).

## When should I use heliosRX?

If your using Firebase as your backend and if you're building an SPA that
is a little bit more complex then a simple todo list, then heliosRX is
probably very useful for you. Some benefits of using heliosRX over
just Firebase Client API are:

- ➡️ Easy, straight forward API based on model definitions/schemata
- ➡️ Define schemas and locations for your data
- ➡️ Consistent data validation on client and server
- ➡️ Automatically generate Security Rules based on schema
- ➡️ Allows easy sorting of objects
- ➡️ Automatic type conversion for timestamps to moment-js
- ➡️ Additional layer of abstraction and therefor less vendor lock-in
- ➡️ State management, no `Vuex` needed (although heliosRX uses Vuex internally)
- ➡️ Write significantly less code

If that makes sense to you, you should give heliosRX a try.

## How it works

To understand how heliosRX works, have a look following picture. Basically the
database is specified by (1) model definition files, that describe *which* fields
can be stored and (2) a path definition file, that describes *where* data is
stored.

![heliosRX](./img/overview.png)

heliosRX uses the bolt language and the [bolt compiler](https://github.com/FirebaseExtended/bolt). The model definitions can then be used to create a
bolt files, which are merged and then compiled to Firebase security rules.

Also an API is generated that can be used to access the database in a straight
forward way. Based on the model definition, model instances can be created from
existing or new data. Under the hood heliosRX creates a new `Vue` instance within
each model instance, that manages state and reactivity, obviating the need
for other state management solutions, like `Vuex`.

<!--
TODO: Mention other similar libs
-->