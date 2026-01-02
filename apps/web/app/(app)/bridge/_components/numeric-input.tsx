import { noop } from "es-toolkit";
import * as React from "react";
import { NumberFormatBase, useNumericFormat } from "react-number-format";
import type {
  InputAttributes,
  NumericFormatProps,
} from "react-number-format/types/types";

import { cn } from "@anchore/ui/lib/utils";

interface Props extends Omit<NumericFormatProps, "onChange"> {
  onInputChange?: React.ChangeEventHandler<HTMLInputElement>;
  onChange?: (value: string) => void;
  isError?: boolean;
  keepFormat?: boolean;
}

const NumericFormatInput = <BaseType extends any = InputAttributes>(
  props: NumericFormatProps<BaseType>
) => {
  const numericFormatProps = useNumericFormat(props);

  return (
    <NumberFormatBase
      {...numericFormatProps}
      format={(numStr) => {
        let formattedValue = numStr;

        // @ts-ignore
        const isKeepFormat = props.keepFormat;

        if (
          isKeepFormat &&
          (numStr === "" || numStr === "-") &&
          (props.suffix !== undefined || props.prefix !== undefined)
        ) {
          formattedValue = `${props.prefix ?? ""}${numStr}${props.suffix ?? ""}`;
        } else if (numericFormatProps.format) {
          formattedValue = numericFormatProps.format(numStr);
        }
        return formattedValue;
      }}
    />
  );
};

export const NumericInput = React.forwardRef<HTMLInputElement, Props>(
  (
    { onInputChange, onChange, decimalScale, isError, className, ...props },
    ref
  ) => {
    return (
      <NumericFormatInput
        placeholder="0"
        thousandSeparator
        decimalScale={decimalScale}
        allowNegative={false}
        className={cn(
          "rounded-none bg-transparent font-medium text-[20px] sm:text-[24px]",
          "focus-visible:!shadow-none focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 focus-visible:ring-transparent",
          "w-full truncate",
          className,
          isError && "text-destructive"
        )}
        {...props}
        onChange={onInputChange ?? noop}
        onValueChange={(values) => onChange?.(values.value)}
        getInputRef={ref}
      />
    );
  }
);

NumericInput.displayName = "NumericInput";
