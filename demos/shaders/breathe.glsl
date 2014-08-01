// position.xy += a_normal.xy * BREATHE_SCALE * smoothstep(0.25, 1., abs(sin(u_time)));
position.xy += a_normal.xy * u_breathe_scale * smoothstep(0.25, 1., abs(sin(u_time)));
