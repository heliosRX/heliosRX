
## Requirements / Wishlist / Features

1. [X] Run on frontend (babel) AND backend (node)
2. [X] Should have basic CRUD operations
3. Should allow batch lists - ??
4. [X] Should implement “move transactions” using batch-queries
5. Handle security rule exceptions
6. Allow writes on de-normalized data (batches)
  6.1 Automatically detect “cached*”

7. [X] Support for Lists (Object-Arrays)
  7.1 [X] Sync local state with server state
  7.2 [X] Listen to child_added, child_updated, child_remove, child_moved
  7.3 [X] Should convert Object-Arrays to JS Arrays / new Map() ?

8. Allow once-fetching instead of on-listener
9. Support Pagination - vis RG
10. Detect when all data has been loaded
11. Allow joins

12. [X] Automatically Validate input --> or maybe NO validation at all, and 100% rely on Security Rules
   12.1 [X] Basic Schema validation
   12.2 [X] Function based validation
   12.3 Schema validation based on bolt
   12.4 Input type validation

13. Should do type conversion
  13.1 Convert Timestamp to e-moment()
  13.2 Convert e-moment() to Timestamp

14. Provide simple logging
15. Should be backend neutral?
16. Should support Key Compression (Rosetta-Stone)
17. Should support DB Sharding
18. Support offline caching
19. [X] Separate read (listen) and write operations?

20. get_last_sortidx_for_commitments !!!
21. Allow easy throttling / debouncing
22. Provide interface for firebase feature keepSynced "scoresRef.keepSynced(true);"
23. Manage user persistence
24. Manage disk persistence
See: https://firebase.google.com/docs/database/android/offline-capabilities

25. Run in a Webworker
See: https://github.com/pkaminski/fireworker

26. DEBUG TOOL as overlay: Which subscribers are active, which stores are available