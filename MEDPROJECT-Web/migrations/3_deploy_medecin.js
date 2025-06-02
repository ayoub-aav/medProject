const Medecin = artifacts.require("Medecin");

module.exports = function (deployer) {
  deployer.deploy(Medecin);
};