// #package js/main

// #include utils
// #include readers
// #include loaders
// #include dialogs
// #include dialogs/renderers
// #include dialogs/tonemappers
// #include ui
// #include RenderingContext.js

class Application {

    vol_id = 0;

constructor() {
    this._communicator = new Communicator();
    this._handleFileDrop = this._handleFileDrop.bind(this);
    this._handleRendererChange = this._handleRendererChange.bind(this);
    this._handleToneMapperChange = this._handleToneMapperChange.bind(this);
    this._handleVolumeLoad = this._handleVolumeLoad.bind(this);
    this._handleEnvmapLoad = this._handleEnvmapLoad.bind(this);
    this.handleSendTF = this.handleSendTF.bind(this);
    this.handleSendTFFinal = this.handleSendTFFinal.bind(this);

    this._renderingContext = new RenderingContext();
    this._canvas = this._renderingContext.getCanvas();
    this._canvas.className += 'renderer';
    document.body.appendChild(this._canvas);

    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this._renderingContext.resize(width, height);
    });
    CommonUtils.trigger('resize', window);

    document.body.addEventListener('dragover', e => e.preventDefault());
    document.body.addEventListener('drop', this._handleFileDrop);

    this._mainDialog = new MainDialog();
    if (!this._renderingContext.hasComputeCapabilities()) {
        this._mainDialog.disableMCC();
    }

    this._statusBar = new StatusBar();
    this._statusBar.appendTo(document.body);

    this._volumeLoadDialog = new VolumeLoadDialog();

    // this._volumeLoadDialog.appendTo(this._mainDialog.getVolumeLoadContainer());

    // this._volumeLoadDialog.addEventListener('load', this._handleVolumeLoad);

    this._loaded = this.getRandomFile();

    this._handleVolumeLoad(this._loaded);

    /*
    this._envmapLoadDialog = new EnvmapLoadDialog();
    this._envmapLoadDialog.appendTo(this._mainDialog.getEnvmapLoadContainer());
    this._envmapLoadDialog.addEventListener('load', this._handleEnvmapLoad);

    this._renderingContextDialog = new RenderingContextDialog();
    this._renderingContextDialog.appendTo(
        this._mainDialog.getRenderingContextSettingsContainer());
    this._renderingContextDialog.addEventListener('resolution', options => {
        this._renderingContext.setResolution(options.resolution);
    });
    this._renderingContextDialog.addEventListener('transformation', options => {
        const s = options.scale;
        const t = options.translation;
        this._renderingContext.setScale(s.x, s.y, s.z);
        this._renderingContext.setTranslation(t.x, t.y, t.z);
    });
    this._renderingContextDialog.addEventListener('filter', options => {
        this._renderingContext.setFilter(options.filter);
    });
    */

    this._mainDialog.addEventListener('rendererchange', this._handleRendererChange);
    this._mainDialog.addEventListener('tonemapperchange', this._handleToneMapperChange);
    this._mainDialog.trigger('rendererchange', this._mainDialog.getSelectedRenderer());
    this._mainDialog.trigger('tonemapperchange', "artistic");

}

_handleFileDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 0) {
        return;
    }
    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.bvp')) {
        return;
    }
    this._handleVolumeLoad({
        type       : 'file',
        file       : file,
        filetype   : 'bvp',
        dimensions : { x: 0, y: 0, z: 0 }, // doesn't matter
        precision  : 8 // doesn't matter
    });
}

_handleRendererChange(which) {
    if (this._rendererDialog) {
        this._rendererDialog.destroy();
    }
    this._renderingContext.chooseRenderer(which);
    const renderer = this._renderingContext.getRenderer();
    const container = this._mainDialog.getRendererSettingsContainer();
    const dialogClass = this._getDialogForRenderer(which);
    this._rendererDialog = new dialogClass(renderer);
    this._rendererDialog.appendTo(container);
    this._rendererDialog.addEventListener('sendfw', this.handleSendTF);
    this._rendererDialog.addEventListener('sendfwfinal', this.handleSendTFFinal);
}

_handleToneMapperChange(which) {
    if (this._toneMapperDialog) {
        this._toneMapperDialog.destroy();
    }
    this._renderingContext.chooseToneMapper(which);
    const toneMapper = this._renderingContext.getToneMapper();
    const container = this._mainDialog.getToneMapperSettingsContainer();
    const dialogClass = this._getDialogForToneMapper(which);
    this._toneMapperDialog = new dialogClass(toneMapper);
    this._toneMapperDialog.appendTo(container);
}

_handleVolumeLoad(options) {
    if (options.type === 'file') {
        const readerClass = this._getReaderForFileType(options.filetype);
        if (readerClass) {
            const loader = new BlobLoader(options.file);
            const reader = new readerClass(loader, {
                width  : options.dimensions.x,
                height : options.dimensions.y,
                depth  : options.dimensions.z,
                bits   : options.precision
            });
            this._renderingContext.stopRendering();
            this._renderingContext.setVolume(reader);
        }
    } else if (options.type === 'url') {
        // const max = Math.max(options.scales.x, options.scales.y, options.scales.z);

        const vol = options.dimensions;
        const vox = options.scales;

        const x = vol.x * vox.x;
        const z = vol.z * vox.z;
        const y = vol.y * vox.y;
        const max = Math.max(x, y, z);
        this._renderingContext.setScale(x / max, y / max, z / max);
        const readerClass = this._getReaderForFileType(options.filetype);
        if (readerClass) {
            const loader = new AjaxLoader(options.url);
            const reader = new readerClass(loader, {
                width  : options.dimensions.x,
                height : options.dimensions.y,
                depth  : options.dimensions.z,
                bits   : options.precision
            });
            // console.log(options.dimensions);

            this._renderingContext.stopRendering();
            this._renderingContext.setVolume(reader);
        }
    }
}

_handleEnvmapLoad(options) {
    let image = new Image();
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => {
        this._renderingContext.setEnvironmentMap(image);
        this._renderingContext.getRenderer().reset();
    });

    if (options.type === 'file') {
        let reader = new FileReader();
        reader.addEventListener('load', () => {
            image.src = reader.result;
        });
        reader.readAsDataURL(options.file);
    } else if (options.type === 'url') {
        image.src = options.url;
    }
}

_getReaderForFileType(type) {
    switch (type) {
        case 'bvp'  : return BVPReader;
        case 'raw'  : return RAWReader;
        case 'zip'  : return ZIPReader;
    }
}

_getDialogForRenderer(renderer) {
    switch (renderer) {
        case 'mip' : return MIPRendererDialog;
        case 'iso' : return ISORendererDialog;
        case 'eam' : return EAMRendererDialog;
        case 'mcs' : return MCSRendererDialog;
        case 'mcm' : return MCMRendererDialog;
        case 'mcc' : return MCMRendererDialog; // yes, the same
    }
}

_getDialogForToneMapper(toneMapper) {
    switch (toneMapper) {
        case 'range'    : return RangeToneMapperDialog;
        case 'reinhard' : return ReinhardToneMapperDialog;
        case 'artistic' : return ArtisticToneMapperDialog;
    }
}

    getRandomFile() {

        const files = [{type: 'url', url: 'images/volumes/aneurism.raw', filetype: 'raw', dimensions: {x: 256, y: 256, z: 256}, precision: 8, scales: {x: 1, y: 1, z: 1}},
            {type: 'url', url: 'images/volumes/angio.raw', filetype: 'raw', dimensions: {x: 384, y: 512, z: 80}, precision: 8, scales: {x: 324673, y: 324885, z: 493750}},
            {type: 'url', url: 'images/volumes/bonsai.raw', filetype: 'raw', dimensions: {x: 256, y: 256, z: 256}, precision: 8, scales: {x: 1, y: 1, z: 1}},
            {type: 'url', url: 'images/volumes/boston_teapot.raw', filetype: 'raw', dimensions: {x: 256, y: 256, z: 256}, precision: 8, scales: {x: 1, y: 1, z: 1}},
            {type: 'url', url: 'images/volumes/brain.raw', filetype: 'raw', dimensions: {x: 512, y: 512, z: 230}, precision: 8, scales: {x: 5, y: 5, z: 9}},
            {type: 'url', url: 'images/volumes/coronal_fem.raw', filetype: 'raw', dimensions: {x: 512, y: 512, z: 44}, precision: 8, scales: {x: 31998, y: 31998, z: 122159}},
            {type: 'url', url: 'images/volumes/coronal_mal.raw', filetype: 'raw', dimensions: {x: 512, y: 512, z: 59}, precision: 8, scales: {x: 45302, y: 45302, z: 98305}},
            {type: 'url', url: 'images/volumes/csafe_heptane.raw', filetype: 'raw', dimensions: {x: 302, y: 302, z: 302}, precision: 8, scales: {x: 1, y: 1, z: 1}},
            {type: 'url', url: 'images/volumes/ct_knee.raw', filetype: 'raw', dimensions: {x: 379, y: 229, z: 305}, precision: 8, scales: {x: 1, y: 1, z: 1}},
            {type: 'url', url: 'images/volumes/engine.raw', filetype: 'raw', dimensions: {x: 256, y: 256, z: 256}, precision: 8, scales: {x: 1, y: 1, z: 1}},
            {type: 'url', url: 'images/volumes/foot.raw', filetype: 'raw', dimensions: {x: 256, y: 256, z: 256}, precision: 8, scales: {x: 1, y: 1, z: 1}},
            {type: 'url', url: 'images/volumes/kidney.raw', filetype: 'raw', dimensions: {x: 384, y: 384, z: 96}, precision: 8, scales: {x: 1090900, y: 1090900, z: 989583}},
            {type: 'url', url: 'images/volumes/monkey_ct.raw', filetype: 'raw', dimensions: {x: 256, y: 256, z: 62}, precision: 8, scales: {x: 1, y: 1, z: 3}},
            {type: 'url', url: 'images/volumes/mri_head.raw', filetype: 'raw', dimensions: {x: 256, y: 256, z: 256}, precision: 8, scales: {x: 5, y: 5, z: 4}},
            {type: 'url', url: 'images/volumes/skull.raw', filetype: 'raw', dimensions: {x: 256, y: 256, z: 256}, precision: 8, scales: {x: 1, y: 1, z: 1}},
            {type: 'url', url: 'images/volumes/statue_leg.raw', filetype: 'raw', dimensions: {x: 341, y: 341, z: 93}, precision: 8, scales: {x: 1, y: 1, z: 4}},
            {type: 'url', url: 'images/volumes/subclavia.raw', filetype: 'raw', dimensions: {x: 512, y: 512, z: 96}, precision: 8, scales: {x: 86636, y: 86636, z: 87963}}];

        const rand = Math.floor(Math.random() * 17);
        this.vol_id = rand;
        const file = files[rand];

        this.dbSendVolume(file.url, "session", rand + 1);

        return file;
    }

    dbSendVolume(volume, session, rand) {

        const xhr = new XMLHttpRequest();
        let paket = {type: "sv", volume: volume, id: rand};
        xhr.open('POST', "../test.db", true);
        xhr.setRequestHeader( "Content-Type", "application/json" );
        xhr.send(JSON.stringify(paket));

    }

    handleSendTF() {

        this._communicator.dbSendTF(this._renderingContext._camera.transformationMatrix, this._rendererDialog._tfwidget._bumps, this._loaded.url, this.vol_id + 1, 0);
    }
    handleSendTFFinal() {

        this._communicator.dbSendTF(this._renderingContext._camera.transformationMatrix, this._rendererDialog._tfwidget._bumps, this._loaded.url, this.vol_id + 1, 1);
    }

}
