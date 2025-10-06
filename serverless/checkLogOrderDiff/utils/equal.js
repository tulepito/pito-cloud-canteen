function deepEqual(obj1, obj2, path = '') {
  // If strictly equal, return equal result
  if (obj1 === obj2) {
    return { equal: true, differences: [] };
  }

  // Check for null/undefined
  if (obj1 == null || obj2 == null) {
    return {
      equal: false,
      differences: [
        {
          path: path || 'root',
          expect: obj1,
          current: obj2,
          type: 'value_mismatch',
        },
      ],
    };
  }

  // Check if both are objects
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return {
      equal: false,
      differences: [
        {
          path: path || 'root',
          expect: obj1,
          current: obj2,
          type: 'value_mismatch',
        },
      ],
    };
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const allKeys = new Set([...keys1, ...keys2]);
  const differences = [];

  Array.from(allKeys).forEach((key) => {
    const currentPath = path ? `${path}.${key}` : key;

    if (!keys1.includes(key)) {
      differences.push({
        path: currentPath,
        expect: undefined,
        current: obj2[key],
        type: 'missing_in_first',
      });
    } else if (!keys2.includes(key)) {
      differences.push({
        path: currentPath,
        expect: obj1[key],
        current: undefined,
        type: 'missing_in_second',
      });
    } else {
      const result = deepEqual(obj1[key], obj2[key], currentPath);
      if (!result.equal) {
        differences.push(...result.differences);
      }
    }
  });

  return {
    equal: differences.length === 0,
    differences,
  };
}

module.exports = deepEqual;
