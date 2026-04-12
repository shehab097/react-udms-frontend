import React from "react";
import { getRole, getToken, getUsername } from "../services/tokenService";

function UserCard() {
    return getToken() ? (
        <div className="border-r text-ui-highlight text-right pr-2">
            <p className="text-sm">user/{getUsername()}</p>
            <p className="text-xs">{getRole()}</p>
        </div>
    ) : (
        <div></div>
    );
}

export default UserCard;
