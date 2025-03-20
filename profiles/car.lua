local find_access_tag = require("lib/access").find_access_tag

local profile = {
    properties = {
        weight_name = "duration",
        max_speed_for_map_matching = 180/3.6,
    },
    default_mode = mode.driving,
    default_speed = 50,
}

function process_way(profile, way, result)
    result.forward_mode = mode.driving
    result.backward_mode = mode.driving
    result.forward_speed = profile.default_speed
    result.backward_speed = profile.default_speed
end

return profile
