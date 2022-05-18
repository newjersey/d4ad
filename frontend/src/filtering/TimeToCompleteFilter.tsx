import React, { ChangeEvent, ReactElement, useContext, useEffect, useState } from "react";
import { FormControlLabel, FormGroup } from "@material-ui/core";
import { SpacedCheckbox } from "../components/SpacedCheckbox";
import { FilterActionType, FilterContext } from "./FilterContext";
import { FilterableElement } from "../domain/Filter";
import { CalendarLength, TrainingResult } from "../domain/Training";
import { useTranslation } from "react-i18next";

interface TimeToComplete {
  days: boolean;
  weeks: boolean;
  months: boolean;
  years: boolean;
}

const TimeToCompleteBuckets = {
  days: [
    CalendarLength.LESS_THAN_ONE_DAY,
    CalendarLength.ONE_TO_TWO_DAYS,
    CalendarLength.THREE_TO_SEVEN_DAYS,
  ],
  weeks: [CalendarLength.TWO_TO_THREE_WEEKS, CalendarLength.FOUR_TO_ELEVEN_WEEKS],
  months: [CalendarLength.THREE_TO_FIVE_MONTHS, CalendarLength.SIX_TO_TWELVE_MONTHS],
  years: [
    CalendarLength.THIRTEEN_MONTHS_TO_TWO_YEARS,
    CalendarLength.THREE_TO_FOUR_YEARS,
    CalendarLength.MORE_THAN_FOUR_YEARS,
  ],
};

const INITIAL_STATE = {
  days: false,
  weeks: false,
  months: false,
  years: false,
};

export const TimeToCompleteFilter = (): ReactElement => {
  const { t } = useTranslation();

  const [timeToComplete, setTimeToComplete] = useState<TimeToComplete>(INITIAL_STATE);

  const { state, dispatch } = useContext(FilterContext);

  useEffect(() => {
    const timeToCompleteFilter = state.filters.find(
      (filter) => filter.element === FilterableElement.TIME_TO_COMPLETE
    );
    if (timeToCompleteFilter) {
      setTimeToComplete(timeToCompleteFilter.value);
    } else if (timeToCompleteFilter == null && Object.values(timeToComplete).some((val) => val)) {
      setTimeToComplete(INITIAL_STATE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filters]);

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    const newTimeToComplete = {
      ...timeToComplete,
      [event.target.name]: checked,
    };

    setTimeToComplete(newTimeToComplete);

    const nothingIsChecked = Object.values(newTimeToComplete).every((value) => !value);

    dispatch({
      type: nothingIsChecked ? FilterActionType.REMOVE : FilterActionType.ADD,
      filter: {
        element: FilterableElement.TIME_TO_COMPLETE,
        value: newTimeToComplete,
        func: (trainingResults): TrainingResult[] =>
          trainingResults.filter((it) => {
            return (
              (newTimeToComplete.days && TimeToCompleteBuckets.days.includes(it.calendarLength)) ||
              (newTimeToComplete.weeks &&
                TimeToCompleteBuckets.weeks.includes(it.calendarLength)) ||
              (newTimeToComplete.months &&
                TimeToCompleteBuckets.months.includes(it.calendarLength)) ||
              (newTimeToComplete.years && TimeToCompleteBuckets.years.includes(it.calendarLength))
            );
          }),
      },
    });
  };

  return (
    <label className="bold" htmlFor="timeToComplete">
      {t("SearchAndFilter.timeToCompleteFilterLabel")}
      <FormGroup id="timeToComplete">
        <FormControlLabel
          control={
            <SpacedCheckbox
              checked={timeToComplete.days}
              onChange={handleCheckboxChange}
              name="days"
              color="primary"
            />
          }
          label={t("SearchAndFilter.timeToCompleteDaysLabel")}
        />
        <FormControlLabel
          control={
            <SpacedCheckbox
              checked={timeToComplete.weeks}
              onChange={handleCheckboxChange}
              name="weeks"
              color="primary"
            />
          }
          label={t("SearchAndFilter.timeToCompleteWeeksLabel")}
        />
        <FormControlLabel
          control={
            <SpacedCheckbox
              checked={timeToComplete.months}
              onChange={handleCheckboxChange}
              name="months"
              color="primary"
            />
          }
          label={t("SearchAndFilter.timeToCompleteMonthsLabel")}
        />
        <FormControlLabel
          control={
            <SpacedCheckbox
              checked={timeToComplete.years}
              onChange={handleCheckboxChange}
              name="years"
              color="primary"
            />
          }
          label={t("SearchAndFilter.timeToCompleteYearsLabel")}
        />
      </FormGroup>
    </label>
  );
};
