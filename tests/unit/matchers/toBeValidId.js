// import { isValidId } from '@/util/types.js'

export default function toBeValidId(received) {
  // const pass = isValidId( received );
  // eslint-disable-next-line no-control-regex, no-useless-escape
  const pass = /^((?![\/\[\]\.\#\$\/\u0000-\u001F\u007F]).)*$/.test( received )
  if (pass) {
    return {
      message: () => `expected ${received} to be valid id`,
      pass: true,
    };
  } else {
    return {
      message: () => `expected ${received} to be valid id`,
      pass: false,
    };
  }
}

expect.extend({ toBeValidId });
