import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import startApp from '../helpers/start-app';

import { isFocused } from '../helpers/assertions';

var modal, app;

moduleForComponent('modal-component', "[Integration] Modal component", {
  needs: ['template:modal', 'template:modal-header', 'template:modal-footer', 'template:modal-content'],

  setup: function() {
    app = startApp();
  },

  teardown: function() {
    window.EMBER_WIDGETS_DISABLE_ANIMATIONS = false;
    Ember.run(function() {
      return modal != null ? modal.destroy() : void 0;
    });
    Ember.run(app, 'destroy');
    return modal = null;
  }
});

test('With DISABLE_ANIMATIONS=true, hide can be called several times', function(assert) {
  assert.expect(1);
  window.EMBER_WIDGETS_DISABLE_ANIMATIONS = true;
  modal = this.subject();
  this.render();
  return andThen(function() {
    modal.hide();
    modal.hide();
    return assert.ok(true, 'hide can be called multiple times when animations are disabled');
  });
});

test('Test tab loop only inside modal', function(assert) {
  var buttonCancel, buttonConfirm, modalComponent, validateFocus;
  assert.expect(3);
  modal = this.subject();
  this.render();
  modalComponent = modal.$();
  modal.set('enforceModality', true);
  buttonConfirm = find('.btn-confirm', modalComponent);
  buttonCancel = find('.btn-cancel', modalComponent);
  validateFocus = function(element, messageFocus) {
    return assert.ok(isFocused(element, modalComponent), messageFocus);
  };
  validateFocus(buttonConfirm, 'Button Confirm should be focused');
  triggerEvent(buttonConfirm, null, 'keydown', {
    keyCode: 9,
    which: 9,
    shiftKey: true
  });
  andThen(function() {
    return validateFocus(buttonCancel, 'Button Cancel should be focused');
  });
  keyEvent(buttonCancel, 'keydown', 9);
  return andThen(function() {
    return validateFocus(buttonConfirm, 'Button Confirm should be focused');
  });
});

test('Test preserving the focus when clicking on non-focusable element', function(assert) {
  var buttonCancel, buttonConfirm, modalBody, modalComponent, validateFocus;
  assert.expect(1);
  modal = this.subject();
  this.render();
  modalComponent = modal.$();
  buttonConfirm = find('.btn-confirm', modalComponent);
  buttonCancel = find('.btn-cancel', modalComponent);
  modalBody = find('.modal-body', modalComponent);
  validateFocus = function(element, messageFocus) {
    return assert.ok(isFocused(element, modalComponent), messageFocus);
  };
  keyEvent(buttonConfirm, 'keydown', 9).then(function() {
    return buttonCancel.focus();
  });
  return click(modalBody).then(function() {
    return validateFocus(buttonCancel, 'The focus should stay on the Cancel button');
  });
});

test('Test pressing Enter to confirm', function(assert) {
  var modalComponent, spy;
  assert.expect(1);
  modal = this.subject({
    enterToConfirm: true
  });
  spy = sinon.spy(modal, "send");
  this.render();
  modalComponent = modal.$();
  keyEvent(modalComponent, 'keydown', 13);
  return andThen(function() {
    return assert.ok(spy.calledWith('sendConfirm'), "sendConfirm gets called when hitting enter");
  });
});

test('Test confirm button has default class of btn-primary', function(assert) {
  var buttonConfirm, modalComponent;
  assert.expect(2);
  modal = this.subject();
  this.render();
  modalComponent = modal.$();
  buttonConfirm = find('.btn-confirm', modalComponent);
  assert.ok(buttonConfirm.hasClass('btn-primary'), 'By default the confirm button has class of btn-primary');
  assert.ok(!buttonConfirm.hasClass('btn-default'), 'By default the confirm button does not have class of btn-default');
});

test('Test confirm button can be set to not have default class of btn-primary', function(assert) {
  var buttonConfirm, modalComponent;
  assert.expect(2);
  modal = this.subject();
  modal.set('isConfirmPrimaryBtn', false);
  this.render();
  modalComponent = modal.$();
  buttonConfirm = find('.btn-confirm', modalComponent);
  assert.ok(!buttonConfirm.hasClass('btn-primary'), 'When isConfirmPrimaryBtn is set to false the confirm button does not have class of btn-primary');
  assert.ok(buttonConfirm.hasClass('btn-default'), 'When isConfirmPrimaryBtn is set to false the confirm button  has class of btn-default');
});
