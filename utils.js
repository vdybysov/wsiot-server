const CONVERTERS = {
    'int': parseInt,
    'decimal': value => +value,
    'bool': value => !!value,
    'bool_str': value => !!value + '',
    'bool_int': value => +!!value
};

const convertValue = (value, format) => {
    const converter = CONVERTERS[format];
    return converter ? converter(value) : value;
}

module.exports = { convertValue };