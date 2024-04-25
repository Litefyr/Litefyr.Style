import React from "react";

export function Square({ size = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
            <rect strokeWidth="2" fill="none" stroke="currentColor" x="1" y="1" width="22" height="22"></rect>
        </svg>
    );
}

export function Circle({ size = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
            <circle strokeWidth="2" stroke="currentColor" fill="none" cx="12" cy="12" r="11"></circle>
        </svg>
    );
}

export function Wave({ size = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
            <path
                fill="none"
                fillRule="nonzero"
                stroke="currentcolor"
                strokeLinecap="round"
                strokeWidth="2"
                d="M1 13.04l1.222 2.586c1.222 2.634 3.667 5.757 6.111 3.779 2.445-1.979 3.89-13.01 7.334-14.988 2.296-1.32 4.74 1.485 7.333 8.412"
            />
        </svg>
    );
}

export function Mountain({ size = 24 }) {
    return (
        <svg viewBox="0 0 752 752" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width={size} height={size}>
            <path
                d="M409.71 224.23c-3.05.04-6.2 1.863-8.434 5.18l-84.949 145.77-25.16-43.363c-1.59-2.762-4.66-4.614-7.843-4.735-3.434-.136-6.868 1.758-8.586 4.735l-104.78 180.26c-5.64 9.367.43 15.703 9.027 15.688h396.03c6.59-.047 11.434-8.5 8.14-14.207l-165.46-284.15c-1.992-3.465-4.94-5.215-7.992-5.18zm-4.438 60.676a9.471 9.471 0 0 1 8.731 4.883l77.551 132.45v.004a9.516 9.516 0 0 1-3.406 13.023 9.516 9.516 0 0 1-13.023-3.406l-77.551-132.6h.004a9.473 9.473 0 0 1 7.695-14.356z"
                fillRule="evenodd"
            />
        </svg>
    );
}

export function ArrowUp({ size = 24 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            width={size}
            height={size}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
        </svg>
    );
}

export function ArrowDown({ size = 24 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            width={size}
            height={size}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
        </svg>
    );
}

export function ArrowLeft({ size = 24 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            width={size}
            height={size}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
        </svg>
    );
}

export function ArrowRight({ size = 24 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            width={size}
            height={size}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
        </svg>
    );
}

export function Peak({ size = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
            <path
                fill="none"
                fillRule="nonzero"
                stroke="currentcolor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 13.3142857L8 20 16 4 23 11.8857143"
            />
        </svg>
    );
}

export function WaveLow({ size = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
            <path
                fill="none"
                fillRule="nonzero"
                stroke="currentcolor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 13.247l1.833-.876c1.834-.876 5.5-2.63 9.167-2.339 3.667.312 7.333 2.613 9.167 3.801L23 15"
            />
        </svg>
    );
}

export function WaveHigh({ size = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
            <path
                fill="none"
                fillRule="nonzero"
                stroke="currentcolor"
                strokeLinecap="round"
                strokeWidth="2"
                d="M1 13.736C2.04 11.933 3.09 5.049 4.146 5c.659.031 1.324 2.817 1.985 5.531.38 1.561.76 3.098 1.138 4.073 1.059 2.574 2.113.935 3.146-.868 1.057-1.803 2.113-3.442 3.146-3.491 1.055.049 2.114 1.688 3.146 4.36 1.052 2.573 2.09 6.178 3.147 5.244 1.05-.869 2.09-6.113 2.618-8.736L23 8.491"
            />
        </svg>
    );
}

export function PeakLow({ size = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
            <path
                fill="none"
                fillRule="evenodd"
                stroke="currentcolor"
                strokeLinecap="round"
                strokeWidth="2"
                d="M5 16l14-7"
            />
        </svg>
    );
}

export function PeakHigh({ size = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
            <path
                fill="none"
                fillRule="nonzero"
                stroke="currentcolor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 21.3703704L4.66666667 7.51851852 8.33333333 21.3703704 12 4.25925926 15.6666667 19.7407407 19.3333333 1 23 23"
            />
        </svg>
    );
}

export function AngleLow({ size = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" width={size} height={size}>
            <path d="M316.3 79l15-28.3L274.7 20.7 259.7 49 56.5 433 31.7 480H84.8 480h32V416H480 137.9L316.3 79zM302.7 173l-22.8 43c22.5 17.9 42.3 38.9 58.8 62.5l40.8-25.3c-21.1-30.7-47.1-57.8-76.8-80.2zm82.3 211h49c-7-37-19.8-71.9-37.6-103.7l-40.8 25.3c13.3 24.2 23.3 50.5 29.4 78.3z" />
        </svg>
    );
}

export function AngleHigh({ size = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width={size} height={size}>
            <path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V448c0 17.7 14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V64zM96 97.6v48.3c31 3.6 60.4 12.5 87.4 25.7l25.3-41.1C174.2 113 136.2 101.6 96 97.6zm115.2 89.7c32.6 21 60.5 48.9 81.5 81.5l40.9-25.2c-25-39-58.2-72.2-97.2-97.2l-25.2 40.9zM334.1 384h48.3c-4-40.2-15.4-78.2-32.9-112.6l-41 25.3c13.2 26.9 22 56.3 25.7 87.4z" />
        </svg>
    );
}
