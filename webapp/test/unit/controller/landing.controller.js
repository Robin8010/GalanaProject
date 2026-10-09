/*global QUnit*/

sap.ui.define([
	"project1/controller/landing.controller"
], function (Controller) {
	"use strict";

	QUnit.module("landing Controller");

	QUnit.test("I should test the landing controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
