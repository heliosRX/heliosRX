export default {

  // Syntax: create( required, optional, BACKEND )
  create({ type }, data, BACKEND) {
    let myitem = {
      a: 'X',
    };

    switch ( type ) {
      case 'TYPE_A':
      Object.assign(myitem,{
        b:          1,
        c:          1
      })
      break

      case 'TYPE_B':
      Object.assign(myitem,{
        x:          true,
        y:          'ASD'
      })
      break
    }

    return myitem;
  },

  fields: {
    'a': { validate_bolt_type: 'String' },
    'b': { validate_bolt_type: 'String', subtype: 'TypeA' },
    'c': { validate_bolt_type: 'String', subtype: 'TypeA' },
    'x': { validate_bolt_type: 'String', subtype: 'TypeB' },
    'y': { validate_bolt_type: 'String', subtype: 'TypeB' },
  }
};

/*
bolt:

path /MixedList/{id} is MixedList {
}

type ID extends String { }

type MixedList {
  items: Map< ID, TypeA | TypeB>
}

type BaseType {
  a: String
}

type TypeA extends BaseType {
  b: Number,
  c: Number,
}

type TypeB extends BaseType {
  x: Boolean,
  y: String,
}

*/
