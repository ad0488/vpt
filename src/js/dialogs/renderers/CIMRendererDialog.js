// #package js/main

// #include ../AbstractDialog.js
// #include ../../TransferFunctionWidget.js

// #include ../../../uispecs/renderers/CIMRendererDialog.json

class CIMRendererDialog extends AbstractDialog {

    constructor(renderer, options) {
        super(UISPECS.CIMRendererDialog, options);
        this._renderer = renderer;

        this._setInitialValues();

        this._handleChange = this._handleChange.bind(this);
        this._handleChangeType = this._handleChangeType.bind(this);
        this._handleChangeRatio = this._handleChangeRatio.bind(this);
        this._handleTFChange = this._handleTFChange.bind(this);
        this._handleChangeMCParameters = this._handleChangeMCParameters.bind(this);
        this._handleChangeSlowdown = this._handleChangeSlowdown.bind(this);
        this._handleChangeDeferredRendering = this._handleChangeDeferredRendering.bind(this);
        this._handleChangeDeNoise = this._handleChangeDeNoise.bind(this);

        // Renderer
        this._binds.steps.addEventListener('input', this._handleChange);
        this._binds.opacity.addEventListener('input', this._handleChange);
        this._binds.mc_enabled.addEventListener('change', this._handleChange);

        this._binds.ratio.addEventListener('input', this._handleChangeRatio);
        this._binds.max_slowdown.addEventListener('input', this._handleChangeSlowdown);
        this._binds.ratio.addEventListener('input', this._handleChangeRatio);

        // MC
        this._binds.majorant_ratio.addEventListener('change', this._handleChangeMCParameters);
        this._binds.extinction_MS.addEventListener('input', this._handleChangeMCParameters);
        this._binds.bias_MS.addEventListener('change', this._handleChangeMCParameters);
        this._binds.bounces_MS.addEventListener('input', this._handleChangeMCParameters);
        this._binds.ray_steps.addEventListener('input', this._handleChange);
        this._binds.renderer_type.addEventListener('input', this._handleChangeType);

        // Deferred Rendering and De-Noise
        this._binds.deferred_enabled.addEventListener('change', this._handleChangeDeferredRendering);
        this._binds.sd_enabled.addEventListener('change', this._handleChangeDeNoise);
        this._binds.sd_sigma.addEventListener('input', this._handleChangeDeNoise);
        this._binds.sd_ksigma.addEventListener('input', this._handleChangeDeNoise);
        this._binds.sd_threshold.addEventListener('input', this._handleChangeDeNoise);

        // ISO
        this._binds.isovalue.addEventListener('change', this._handleChangeMCParameters);
        this._binds.color.addEventListener('change', this._handleChange);
        this._binds.direction.addEventListener('input', this._handleChangeMCParameters);
        this._binds.p.addEventListener('input', this._handleChange);
        this._binds.shader_type.addEventListener('input', this._handleChange);
        // BRDF
        this._binds.metalic.addEventListener('change', this._handleChange);

        // const f0 = CommonUtils.hex2rgb(this._binds.f0.getValue());
        // this._renderer.f0[0] = f0.r;
        // this._renderer.f0[1] = f0.g;
        // this._renderer.f0[2] = f0.b;
        //
        // const f90 = CommonUtils.hex2rgb(this._binds.f90.getValue());
        // this._renderer.f90[0] = f90.r;
        // this._renderer.f90[1] = f90.g;
        // this._renderer.f90[2] = f90.b;
        this._binds.specularWeight.addEventListener('change', this._handleChange);
        this._binds.alphaRoughness.addEventListener('change', this._handleChange);

        // Transfer Function

        this._tfwidget = new TransferFunctionWidget();
        this._binds.tfcontainer.add(this._tfwidget);
        this._tfwidget.addEventListener('change', this._handleTFChange);
    }

    _setInitialValues() {
        this._renderer._steps = this._binds.ray_steps.getValue();

        const extinction = this._binds.extinction_MS.getValue();
        const ratio      = this._binds.majorant_ratio.getValue();

        this._renderer._extinctionScale = extinction;
        this._renderer._scatteringBias = this._binds.bias_MS.getValue();
        this._renderer._majorant = extinction * ratio;
        this._renderer._maxBounces = this._binds.bounces_MS.getValue();

        this._renderer._lightVolumeRatio = this._binds.ratio.getValue();
        this._renderer._mcEnabled = this._binds.mc_enabled.isChecked();
        this._renderer._type = parseInt(this._binds.renderer_type.getValue());

        this._renderer._deferredRendering = this._binds.deferred_enabled.isChecked();
        this._renderer._smartDeNoise = this._binds.sd_enabled.isChecked();
        this._renderer._smartDeNoiseSigma = this._binds.sd_sigma.getValue();
        this._renderer._smartDeNoiseKSigma = this._binds.sd_ksigma.getValue();
        this._renderer._smartDeNoiseThreshold = this._binds.sd_threshold.getValue();

        // ISO
        const metalic = this._binds.metalic.getValue();
        this._renderer._isovalue = this._binds.isovalue.getValue();
        const color = CommonUtils.hex2rgb(this._binds.color.getValue());
        this._renderer._diffuse[0] = color.r * (1 - metalic);
        this._renderer._diffuse[1] = color.g * (1 - metalic);
        this._renderer._diffuse[2] = color.b * (1 - metalic);
        this._renderer.p = this._binds.p.getValue();
        this._renderer._shaderType = parseInt(this._binds.shader_type.getValue());

        const direction = this._binds.direction.getValue();
        this._renderer._light[0] = direction.x;
        this._renderer._light[1] = direction.y;
        this._renderer._light[2] = direction.z;

        //BRDF
        // const f0 = CommonUtils.hex2rgb(this._binds.f0.getValue());
        // this._renderer.f0[0] = f0.r;
        // this._renderer.f0[1] = f0.g;
        // this._renderer.f0[2] = f0.b;
        this._renderer.f0[0] = 0.04 * (1 - metalic) + color.r * metalic;
        this._renderer.f0[1] = 0.04 * (1 - metalic) + color.g * metalic;
        this._renderer.f0[2] = 0.04 * (1 - metalic) + color.b * metalic;

        const f90 = CommonUtils.hex2rgb(this._binds.f90.getValue());
        this._renderer.f90[0] = f90.r;
        this._renderer.f90[1] = f90.g;
        this._renderer.f90[2] = f90.b;
        this._renderer.specularWeight = this._binds.specularWeight.getValue();
        this._renderer.alphaRoughness = this._binds.alphaRoughness.getValue();
    }

    destroy() {
        this._tfwidget.destroy();
        super.destroy();
    }

    _handleChange() {
        this._renderer._stepSize = 1 / this._binds.steps.getValue();
        this._renderer._alphaCorrection = this._binds.opacity.getValue();
        this._renderer._steps = this._binds.ray_steps.getValue();
        this._renderer._mcEnabled = this._binds.mc_enabled.isChecked();

        this._renderer._isovalue = this._binds.isovalue.getValue();

        const metalic = this._binds.metalic.getValue();
        const color = CommonUtils.hex2rgb(this._binds.color.getValue());
        this._renderer._diffuse[0] = color.r * (1 - metalic);
        this._renderer._diffuse[1] = color.g * (1 - metalic);
        this._renderer._diffuse[2] = color.b * (1 - metalic);

        // const f0 = CommonUtils.hex2rgb(this._binds.f0.getValue());
        // this._renderer.f0[0] = f0.r;
        // this._renderer.f0[1] = f0.g;
        // this._renderer.f0[2] = f0.b;
        this._renderer.f0[0] = 0.04 * (1 - metalic) + color.r * metalic;
        this._renderer.f0[1] = 0.04 * (1 - metalic) + color.g * metalic;
        this._renderer.f0[2] = 0.04 * (1 - metalic) + color.b * metalic;
        const f90 = CommonUtils.hex2rgb(this._binds.f90.getValue());
        this._renderer.f90[0] = f90.r;
        this._renderer.f90[1] = f90.g;
        this._renderer.f90[2] = f90.b;
        this._renderer.specularWeight = this._binds.specularWeight.getValue();
        this._renderer.alphaRoughness = this._binds.alphaRoughness.getValue();
        this._renderer.p = this._binds.p.getValue();
        this._renderer._shaderType = parseInt(this._binds.shader_type.getValue());
    }

    _handleChangeType() {
        this._renderer._type = parseInt(this._binds.renderer_type.getValue());
        this._resetPhotons();
    }

    _handleChangeMCParameters() {
        const extinction = this._binds.extinction_MS.getValue();
        const bias       = this._binds.bias_MS.getValue();
        const ratio      = this._binds.majorant_ratio.getValue();
        const bounces    = this._binds.bounces_MS.getValue();

        this._renderer._extinctionScale = extinction;
        this._renderer._scatteringBias = bias;
        this._renderer._majorant = extinction * ratio;
        this._renderer._maxBounces = bounces;

        this._renderer._isovalue = this._binds.isovalue.getValue();
        const color = CommonUtils.hex2rgb(this._binds.color.getValue());
        this._renderer._diffuse[0] = color.r;
        this._renderer._diffuse[1] = color.g;
        this._renderer._diffuse[2] = color.b;

        const direction = this._binds.direction.getValue();
        this._renderer._light[0] = direction.x;
        this._renderer._light[1] = direction.y;
        this._renderer._light[2] = direction.z;

        this._renderer.resetLightVolume();
    }

    _handleChangeRatio() {
        this._renderer._lightVolumeRatio = this._binds.ratio.getValue();
        if (this._renderer._volumeDimensions) {
            this._renderer._setLightVolumeDimensions();
            this._renderer._setAccumulationBuffer();
            this._renderer.resetLightVolume();
        }
    }

    _handleChangeSlowdown() {
        this._renderer._allowedSlowdown = this._binds.max_slowdown.getValue();
        this._renderer._layersPerFrame = 1
        this._renderer._fastStart = true
    }

    _handleChangeDeferredRendering() {
        const deferredRendering = this._binds.deferred_enabled.isChecked();
        if (deferredRendering && !this._renderer._defferedRenderBuffer)
            this._renderer._buildDeferredRenderBuffer();
        else if (!deferredRendering && this._renderer._deferredRendering)
            this._renderer._destroyDeferredRenderBuffer();
        this._renderer._deferredRendering = deferredRendering;
    }

    _handleChangeDeNoise() {
        this._renderer._smartDeNoise = this._binds.sd_enabled.isChecked();
        this._renderer._smartDeNoiseSigma = this._binds.sd_sigma.getValue();
        this._renderer._smartDeNoiseKSigma = this._binds.sd_ksigma.getValue();
        this._renderer._smartDeNoiseThreshold = this._binds.sd_threshold.getValue();
    }

    _handleTFChange() {
        this._renderer.setTransferFunction(this._tfwidget.getTransferFunction());
        this._renderer.resetLightVolume()
    }
}
