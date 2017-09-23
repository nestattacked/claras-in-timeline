(function (factory) {

  //if it's node environment, add exports object to module.exports
  if(typeof(module) !== 'undefined' && module.exports) {
    module.exports = factory();
  }
  //if it's browser environment, add exports object to window
  else {
    window.MODULE_NAME = factory();
  }

})(function () {

  function tell () {
    console.log('call function in module');
  }

  //return a object including what you want to export
  return {
    variable: 'variable in module',
    function: tell
  };

});
