// #part /glsl/mixins/Photon

struct Photon {
    vec3 position;
    vec3 direction;
    vec3 transmittance;
    float smittance;
    vec3 currentRadiance;
    vec3 radiance;
    uint bounces;
    uint samples;
};
