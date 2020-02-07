# Deading with Relations

::: warning Work in Progress (05/6/2020)
This section is still a work in progress. It will be updated soon.

heliosRX currently focuses more on the "O" and "M" not so much the "R" on "ORM".
This section will therefor elaborate a little bit on the following topics:

- Explain what relationships mean with NoSQL
- Explain what "relations management" means in the context of heliosRX / Firebase
- Give examples how relationships are managed in heliosRX / Firebase
:::

### Example 1: Nested data (1:N)

- `/project/{projecId}`
- `/project/{projecId}/task/{taskId}`

### Example 2: Parallel data (1:1)

- `/project/{projecId}/task/{taskId}`
- `/project/{projecId}/task_details/{taskId}`


### Example 3: Reference (N:M)

- `/user/{userId}`
- `/user/{userId}/project_list/{projectId} -> Project Reference`


### Example 4: Reverse reference (N:M)

- `/project/{projectId}/members/{userId} -> User Reference`


### Example 5: Relationship (N:M)

- `/user/{userId}/friends/{userId} = true`
