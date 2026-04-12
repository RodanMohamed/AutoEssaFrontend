import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for Egyptian mobile numbers
 * Must start with 010, 012, 011, or 015 followed by 8 more digits (11 digits total)
 */
export function egyptianPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const phoneValue = control.value.toString().trim();

    // Check if phone number matches Egyptian pattern (11 digits starting with 010, 012, 011, or 015)
    const egyptianPhonePattern = /^(010|012|011|015)\d{8}$/;

    if (!egyptianPhonePattern.test(phoneValue)) {
      return {
        invalidEgyptianPhone: {
          value: control.value,
          message: 'Please enter a valid Egyptian phone number starting with 010, 012, 011, or 015'
        }
      };
    }

    return null;
  };
}

/**
 * Validator for year not less than specified minimum year
 * Default minimum year is current year (for booking to not be in the past)
 */
export function minYearValidator(minYear: number = new Date().getFullYear()): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    // Extract year from date string (YYYY-MM-DD format)
    const dateValue = control.value;
    let year: number;

    if (typeof dateValue === 'string') {
      const parts = dateValue.split('-');
      year = parseInt(parts[0], 10);
    } else if (dateValue instanceof Date) {
      year = dateValue.getFullYear();
    } else {
      return null;
    }

    if (isNaN(year)) {
      return null;
    }

    if (year < minYear) {
      return {
        yearTooSmall: {
          value: control.value,
          message: `Year must not be less than ${minYear}`
        }
      };
    }

    return null;
  };
}
