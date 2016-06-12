exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
  	"spec/end-to-end/quest-crud.js"
  ]
};