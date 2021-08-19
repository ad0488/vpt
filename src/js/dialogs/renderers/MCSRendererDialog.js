// #package js/main

// #include ../AbstractDialog.js
// #include ../../TransferFunctionWidget.js

// #include ../../../uispecs/renderers/MCSRendererDialog.json

class MCSRendererDialog extends AbstractDialog {

constructor(renderer, options) {
    super(UISPECS.MCSRendererDialog, options);

    this._renderer = renderer;

    this._handleChange = this._handleChange.bind(this);
    this._handleTFChange = this._handleTFChange.bind(this);
    this._toolHandleEvent = this._toolHandleEvent.bind(this);

    this._binds.extinction.addEventListener('input', this._handleChange);

    this._tfwidget = new TransferFunctionWidget();
    this._binds.tfcontainer.add(this._tfwidget);
    this._tfwidget.addEventListener('change', this._handleTFChange);
    this._tfwidget.addEventListener('tool', this._toolHandleEvent);
}

destroy() {
    this._tfwidget.destroy();
    super.destroy();
}

_handleChange() {
    this._renderer._sigmaMax = this._binds.extinction.getValue();
    this._renderer._alphaCorrection = this._binds.extinction.getValue();

    this._renderer.reset();
}

_handleTFChange() {
    this._renderer.setTransferFunction(this._tfwidget.getTransferFunction());
    this._renderer.reset();
}

_toolHandleEvent() {
    this.trigger('tool');
}

}
