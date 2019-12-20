# Model definition

```js
export default {

  // Syntax: create( required, optional, BACKEND )
  create({ name }, data, BACKEND) {
    return {
      a:             0,
      b:             name,
    };
  },

  fields: [
    { model: 'a', validate_bolt_type: 'Number' },
    { model: 'b', required: true },
    { model: 'long_name',  abbrv: 'ln' },
    { model: 'short_name', abbrv: 'sn' }
    ...
  ],

  // - or -

  fields: {
    createdAt: {
      validate_bolt_type: 'ServerTimestamp',
    },
    name: {
      validate: () => true,
      validate_bolt_type: 'String',
      required: true,
      abbrv: 'n'
    },
    a: {
      validate_bolt_type: 'String',
      validate: v => v.length < 30
    },
    b: {
      validate_bolt_type: 'Boolean',
      validate: () => true
    },
    someNumber: {
      validate_bolt_type: 'Number',
      validate: () => true
    },
  },
};
```


asdas

# ajdasjlkdas

saldjöasjdas#askdljsdklja


## 131123

asdadsada

## 123123

123123212


# AAa

asjkhljdahasjhjs
