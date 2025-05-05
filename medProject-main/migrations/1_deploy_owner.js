const Owner = artifacts.require("Owner");

module.exports = function (deployer) {
  deployer.deploy(Owner);
};