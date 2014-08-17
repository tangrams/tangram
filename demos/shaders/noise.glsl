// Default wrap space for noise if not specified
#if defined(WORLD_POSITION_WRAP)
    #define NOISE_WRAP WORLD_POSITION_WRAP
#else
    #define NOISE_WRAP 100000.
#endif

#if defined(EFFECT_NOISE_ANIMATED)
    color *= (abs(pnoise((v_world_position.xyz + vec3(u_time * 5., u_time * 7.5, u_time * 10.)) / 10.0, vec3(NOISE_WRAP / 10.0))) / 4.0) + 0.75;
#else
    color *= (abs(pnoise(v_world_position.xyz / 10.0, vec3(NOISE_WRAP / 10.0))) / 4.0) + 0.75;
#endif
