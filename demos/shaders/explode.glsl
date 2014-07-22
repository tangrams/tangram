// position.xy += a_normal.xy * EXPLODE_SCALE * smoothstep(0.25, 1., abs(sin(u_time)));
position.xy += a_normal.xy * u_scale * smoothstep(0.25, 1., abs(sin(u_time)));
