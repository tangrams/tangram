#if defined(EFFECT_NOISE_ANIMATED)
    color *= (abs(cnoise((v_position_world.xyz + vec3(u_time * 5., u_time * 7.5, u_time * 10.)) / 10.0)) / 4.0) + 0.75;
#else
    color *= (abs(cnoise(v_position_world.xyz / 10.0)) / 4.0) + 0.75;
#endif
