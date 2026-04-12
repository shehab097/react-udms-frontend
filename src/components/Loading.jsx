import React from "react";

const Loading = () => {
    return (
        <div className="flex items-center justify-center p-20">
            <div className="w-8 h-8 border-2 border-ui-accent/20 border-t-ui-accent rounded-full animate-spin" />
        </div>
    );
};

export default Loading;
