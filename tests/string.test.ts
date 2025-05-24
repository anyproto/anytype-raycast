import assert from 'assert';
import { pluralize } from '../src/utils/string';

assert.strictEqual(pluralize(2, 'city'), 'cities');
assert.strictEqual(pluralize(2, 'key'), 'keys');
assert.strictEqual(pluralize(2, 'boy'), 'boys');
assert.strictEqual(pluralize(1, 'city'), 'city');

console.log('All tests passed');
