import React, { useMemo, useState, useEffect } from "react";
import { DropDown, Button, Label } from "@neos-project/react-ui-components";
import style from "./style.module.css";
import { nanoid } from "nanoid";

export default function Dropdown({ label, options, value, onChange, plainOptions = false }) {
    const id = useMemo(() => nanoid(), []);
    const [open, setOpen] = useState(false);
    const [header, setHeader] = useState("");

    useEffect(() => {
        if (plainOptions) {
            const option = options.find((option) => option === value);
            setHeader(option || "");
            return;
        }
        // Get label based on value and options
        const option = options.find((option) => option?.value === value);
        setHeader(option ? option?.label || option?.value : "");
    }, [value]);

    return (
        <>
            {label && <Label htmlFor={id}>{label}</Label>}
            <DropDown.Stateless id={id} isOpen={open} onToggle={() => setOpen(!open)} onClose={() => setOpen(false)}>
                <DropDown.Header id={`${id}-header`} shouldKeepFocusState={false} showDropDownToggle={true}>
                    {header}
                </DropDown.Header>
                <DropDown.Contents id={`${id}-contents`} scrollable={false} className={style.dropdownContents}>
                    {options.map((option, index) => (
                        <li key={index}>
                            <Button
                                onClick={() => onChange(plainOptions ? option : option?.value)}
                                className={style.dropdownButton}
                            >
                                {plainOptions ? option : option?.label || option?.value}
                            </Button>
                        </li>
                    ))}
                </DropDown.Contents>
            </DropDown.Stateless>
        </>
    );
}
