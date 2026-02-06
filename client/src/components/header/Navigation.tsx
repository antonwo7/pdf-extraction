'use client'

import React from 'react';

const Navigation = () => {
    const navigateTo = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        const to = e.currentTarget?.dataset?.to
        if (!to) return;

        // scrollToElement(to)
    }

    return (
        <ul className="nav nav-justified header_nav">

        </ul>
    );
};

export default Navigation;