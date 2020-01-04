export default {

  templatePath: '/foobar/{myid}/*',

  rules: ```
    read() { true }
    write() { true }
  ```,

  fields: {

  },

  modelDefinition:
}

export const example2 = new GenericStore(
  "/example2/*",
  exampleModelDefinition,
  { uidMethod: UIDMethod.TIMESTAMP }
);

/*

let ex = new $models.Example();

import { Example } from '@/models';
let ex = new Example({ ... });

----

this.$models.example.with({  })

----

New syntax:

let goal = this.$models.goal.with({ goalId: 1 }).subscribeNode();
let goal = this.$models.goal.subscribeNode( 1 );

goal.tasks -> GenericList
goal.getChildren('task', { taskId: 2 })
goal.tasks.with({ taskId: 2 })

// Thinking: 1. What do I want?

this.$models.tasks.fromParent( goal ).subscribeNode( 2 )

$registry.get( 'task', {   })

$models.goal( 1 ).task( 2 ).subscribe();
$models.goal( 1 ).task( '*' ).subscribe();
$models.goal( 1 ).task().subscribe();

subscribe( Example, { goalId: 2, taskId: 1, goal } )

"The missing ORM library for firebase, active record"

AR:
    belongs_to
    has_one
    has_many
    has_many :through
    has_one :through
    has_and_belongs_to_many

----

$models.goal.subscribeListWithChildren( 1 );

----

new $models.task()

$models.goal.last100().subscribe()

subscribeListLast100()




----
----



*/