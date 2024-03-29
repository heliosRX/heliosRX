// eslint-disable-next-line import/no-unresolved
import Vue from 'vue'

import GenericModel from '@/classes/GenericModel'
import GenericList from '@/classes/GenericList'
import { DeleteMode } from '@/store/enums.js'
import factory from '@/classes/factory'
import { create_context } from './mock-context';
import moment from '@/moment'

const DISABLE_WARNINGS = true;

describe('GenericModel', () => {

  if ( DISABLE_WARNINGS ) {
    global.console.warn = () => {}
  }

  factory.configure({ GenericList, GenericModel });

  /* eslint-disable quote-props */
  const modelDefinition = {
    modelGetters: {
      example: ( $model, $models ) => {
        // let myId = $store.definedProps[ 'myId' ]
        return 'return-example'
      },
    },
    modelActions: {
      exampleAction({ $model, $models }) {
        return "return-action"
      },
    },
    schema: {
      fields: {
        serverField: { type: 'ServerTimestamp' },
        tsField: { type: 'Timestamp' },
        strField: { type: 'String' },
        boolField: { type: 'Boolean' },
        numField: { type: 'Number' },
        numField2: { type: 'Number' },
        custValidatorField: {
          type: 'String',
          validator: (s) => s.length < 5
        },
        'x/y': { type: 'Boolean' },
        'x.z': { type: 'Boolean' },
      },
    }
  }

  let context = create_context( modelDefinition, "teststore" )

  test('make_reactive_model', () => {

    let data = {
      strField: 'abc',
      boolField: true,
    }

    let model = factory.make_reactive_model(
      modelDefinition,
      data,
      context
    );

    model.$id = 'id1'; // TODO: Move to make_reactive_model
    model.$noaccess = false;

    model.numField = 1;

    expect(model).toBeInstanceOf(GenericModel)
    expect(Object.keys(model.$state).length).toBe(3)

    expect(model.strField).toBe('abc')
    expect(model.boolField).toBe(true)
    expect(model.numField).toBe(1)

    expect(model.$ready).toBe(true)
    expect(model.$id).toBe("id1")
    expect(model.$idx).toBe(null)
    expect(model.$invalid).toMatchObject({})
    expect(model.$isValid).toBe(true)

    expect(model.$key).toBe("KEY-teststore-id1")
    expect(model._store_name).toBe("teststore")

    expect(model.$vm).toBeInstanceOf(Vue)
    expect(model.$vm.example).toBe("return-example")
    expect(model.getters.example).toBe("return-example")

    expect(model.exampleAction()).toBe("return-action")

    expect(model.$model).toMatchObject({ modelDefinition })
    expect(model.$exists).toBe(true)
    expect(model.$noaccess).toBe(false)

    expect(model._validation_behaviour).toBe('WARNING')

    model.numField2 = moment('2020-01-01');
    expect(model.numField2).toBe(1577833200)

    model.numField2 = 'string';
    expect(model.numField2).toBe('string')

    expect( model.$dirty ).toEqual(expect.objectContaining({
      numField: true,
      numField2: true,
    }))
  });

  test('timestamps', () => {
    let data = {
      tsField: 1573215651,
      serverField: 1573215651 * 1000,
    }

    let model = factory.make_reactive_model(
      modelDefinition,
      data,
      context
    );

    expect(model.tsField).toBeInstanceOf(moment)
    expect(model.tsField.format('YYYY-MM-DD')).toBe("2019-11-08")

    expect(model.serverField).toBeInstanceOf(moment)
    expect(model.serverField.format('YYYY-MM-DD')).toBe("2019-11-08")

    expect( moment.isValidDate( moment(null) ) ).toBe(false)

    const spy = jest.spyOn(global.console, 'warn')
    model.numField2 = moment(null);
    expect(spy).toHaveBeenCalled();
    expect(model.numField2).toBe(NaN) // TODO

    let modelNull = factory.make_reactive_model(
      modelDefinition,
      { tsField: null, serverField: null },
      context
    );

    expect(modelNull.tsField).toBeNull()
    expect(modelNull.serverField).toBeNull()

    // TODO: except warning
    let modelInvalid = factory.make_reactive_model(
      modelDefinition,
      { tsField: "string", serverField: "string" },
      context
    );

    // console.log("modelInvalid.serverField", modelInvalid.serverField)

    // expect(modelInvalid.tsField).toBe("string")
    // expect(modelInvalid.serverField).toBe("string")

    expect(modelInvalid.tsField).toBeInstanceOf(moment)
    expect(modelInvalid.serverField).toBeInstanceOf(moment)

    expect(moment.isValidDate(modelInvalid.tsField)).toBe(false)
    expect(moment.isValidDate(modelInvalid.serverField)).toBe(false)

    let modelUndefined = factory.make_reactive_model(
      modelDefinition,
      {},
      context
    );

    expect(modelUndefined.tsField).toBeInstanceOf(moment)
    expect(modelUndefined.tsField.isValid()).toBe(false)
    expect(moment.isValidDate(modelInvalid.tsField)).toBe(false)

    expect(modelUndefined.serverField).toBeInstanceOf(moment)
    expect(modelUndefined.serverField.isValid()).toBe(false)
    expect(moment.isValidDate(modelInvalid.serverField)).toBe(false)
  });

  test('custom validators', () => {

    let data = {}
    let model = factory.make_reactive_model(
      modelDefinition,
      data,
      context
    );

    // TODO: ELEMENT_VALIDATION

    const spy = jest.spyOn(global.console, 'warn')

    expect(model._validation_behaviour).toBe('WARNING')

    model.setValidationBehaviour('NONE')
    expect(model._validation_behaviour).toBe('NONE')

    spy.mockClear()
    model.custValidatorField = 'abcdefghijkl'
    expect(model.custValidatorField).toBe('abcdefghijkl')
    expect(spy).not.toHaveBeenCalled();
    spy.mockClear()

    model.setValidationBehaviour('WARNING')
    expect(model._validation_behaviour).toBe('WARNING')

    model.custValidatorField = 'abcdefghijkl'
    expect(model.custValidatorField).toBe('abcdefghijkl')
    expect(spy).toHaveBeenCalled();
    spy.mockClear()

    model.setValidationBehaviour('ERROR')
    expect(model._validation_behaviour).toBe('ERROR')

    expect(() => {
      model.custValidatorField = 'abcdefghijkl'
    }).toThrowError();

    expect( model.$invalid ).toEqual(expect.objectContaining({
      custValidatorField: true
    }))

    model.custValidatorField = 'abc'
    expect( model.$invalid ).toMatchObject({})

    expect(model.custValidatorField).toBe('abc')
  });

  test('nested data', () => {
    let data = {
      x: {
        z: false
      }
    }
    let model = factory.make_reactive_model(
      modelDefinition,
      data,
      context
    );

    expect(model.$state.x.z).toBe(false)

    let model2 = model.clone()

    model['x.y'] = true

    expect(model['x.y']).toBe(true)
    expect(model.$state.x.y).toBe(true)

    model['x.z'] = true

    expect(Object.hasOwnProperty.call(model, 'x.z')).toBe(true)
    expect(Object.hasOwnProperty.call(model, 'x/z')).toBe(false)

    expect(model['x.z']).toBe(true)
    expect(model.$state.x.z).toBe(true)

    model2['x/y'] = false
    expect(model2['x/y']).toBe(false)

    // TODO !!!
    /*

    expect(() => {
      model2['x/y'] = false
    }).toThrow()

    // or

    expect(model2.$state.x.y).toBe(false)
    expect( Object.keys(model) ).not.toEqal(
      expect.arrayContaining(['x/y'])
    );
    expect(model['x.y']).toBe(false)
    */
    // TODO !!!
  });

  test('non existing data', () => {

    let data = {
      '.exists': false
    }

    let model = factory.make_reactive_model(
      modelDefinition,
      data,
      context
    );

    expect(model.$exists).toBe(false)
  });

  test('wite', () => {

    let model = factory.make_reactive_model(
      modelDefinition,
      {},
      context
    );

    model.numField = 1;
    model.strField = "test"

    model.write().then(id => {
      expect(id).toBe('abc');
      expect(context.model.update).toHaveBeenCalledWith("abc", {numField: 1, strField: "test"})
    });
  });

  test('update', () => {

    let model = factory.make_reactive_model(
      modelDefinition,
      {},
      context
    );

    model.$id = 'xyz'
    // console.log("model.$model", model.$model)

    let p1 = model.update({ numField: 2 }).then(id => {
      expect(model.$id).toBe('xyz');
      expect(id).toBe('xyz');
      expect(context.model.update).toHaveBeenCalledWith("xyz", { numField: 2 })
    })

    let p2 = model.remove(true).then(() => {
      expect(context.model.remove).toHaveBeenCalledWith("xyz", true)
    })

    model.$model.defaultDeleteMode = DeleteMode.SOFT;
    let p3 = model.remove().then(() => {
      expect(context.model.remove).toHaveBeenCalledWith("xyz", true)
    })

    model.$model.defaultDeleteMode = DeleteMode.HARD;
    let p4 = model.remove().then(() => {
      expect(context.model.remove).toHaveBeenCalledWith("xyz", false)
    })

    let p5 = model.restore().then(() => {
      expect(context.model.restore).toHaveBeenCalledWith("xyz")
    })

    return Promise.all([p1, p2, p3, p4, p5])
  })
})
