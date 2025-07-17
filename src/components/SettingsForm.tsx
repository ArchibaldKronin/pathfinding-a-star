import { useEffect, useState, type FC } from "react";
import type {
  ConnectionPoint,
  Rect,
  RectIdentificatorType,
} from "../types/commonTypes";
import {
  getAxleForMovementByAngle,
  getConPointMovementDiapason,
} from "../geometry/utils";
import type { AppStateType } from "../App";
import { set } from "lodash";

export interface SettingsFormProps {
  rectA: Rect;
  rectB: Rect;
  conPointA: ConnectionPoint;
  conPointB: ConnectionPoint;
  onSubmit: (newState: AppStateType) => void;
}

const SettingsForm: FC<SettingsFormProps> = ({
  rectA,
  rectB,
  conPointA,
  conPointB,
  onSubmit,
}) => {
  const [rectASettingsState, setRectASettingsState] =
    useState<RectSettingsStateType>({ rect: rectA, conPoint: conPointA });
  const [rectBSettingsState, setRectBSettingsState] =
    useState<RectSettingsStateType>({ rect: rectB, conPoint: conPointB });

  useEffect(() => {
    setRectASettingsState({ rect: rectA, conPoint: conPointA });
  }, [rectA, conPointA]);

  useEffect(() => {
    setRectBSettingsState({ rect: rectB, conPoint: conPointB });
  }, [rectB, conPointB]);

  function handleInputChange(
    rectIdentifictor: RectIdentificatorType,
    newRectSettingsState: RectSettingsStateType
  ) {
    const setter =
      rectIdentifictor === "A" ? setRectASettingsState : setRectBSettingsState;
    setter(newRectSettingsState);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newState: AppStateType = {
      rectA: structuredClone(rectASettingsState.rect),
      rectB: structuredClone(rectBSettingsState.rect),
      conPointA: structuredClone(rectASettingsState.conPoint),
      conPointB: structuredClone(rectBSettingsState.conPoint),
    };
    onSubmit(newState);
  };

  const handleRangeChangeComplete = () => {
    const newState: AppStateType = {
      rectA: structuredClone(rectASettingsState.rect),
      rectB: structuredClone(rectBSettingsState.rect),
      conPointA: structuredClone(rectASettingsState.conPoint),
      conPointB: structuredClone(rectBSettingsState.conPoint),
    };

    onSubmit(newState);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="settingsForm">
        <RectSettingsFields
          rectIdentificator="A"
          rectSettings={rectASettingsState}
          onChange={handleInputChange}
          onRangeChangeComplete={handleRangeChangeComplete}
        />
        <RectSettingsFields
          rectIdentificator="B"
          rectSettings={rectBSettingsState}
          onChange={handleInputChange}
          onRangeChangeComplete={handleRangeChangeComplete}
        />
        <input type="submit" value={"Рассчитать путь"} />
      </div>
    </form>
  );
};

interface RectSettingsFieldsProps {
  rectSettings: RectSettingsStateType;
  rectIdentificator: RectIdentificatorType;
  onChange: (
    rectIdentifictor: RectIdentificatorType,
    newRectSettingsState: RectSettingsStateType
  ) => void;
  onRangeChangeComplete: () => void;
}

type RectSettingsStateType = {
  rect: Rect;
  conPoint: ConnectionPoint;
};

export const RectSettingsFields: FC<RectSettingsFieldsProps> = ({
  rectSettings,
  rectIdentificator,
  onChange,
  onRangeChangeComplete,
}) => {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [currentAxleConPointState, setCurrentAxleConPointState] = useState<
    "X" | "Y"
  >(getAxleForMovementByAngle(rectSettings.conPoint.angle));
  const [conPointMovementDiapason, setConPointMovementDiapason] = useState<
    [number, number]
  >(getConPointMovementDiapason(rectSettings.rect, currentAxleConPointState));
  const [rangeClicked, setRangeClicked] = useState(false);

  useEffect(() => {
    setCurrentAxleConPointState(
      getAxleForMovementByAngle(rectSettings.conPoint.angle)
    );
    setConPointMovementDiapason(
      getConPointMovementDiapason(rectSettings.rect, currentAxleConPointState)
    );
  }, [rectSettings, currentAxleConPointState]);

  useEffect(() => {
    setCurrentAxleConPointState(
      getAxleForMovementByAngle(rectSettings.conPoint.angle)
    );
    setConPointMovementDiapason(
      getConPointMovementDiapason(rectSettings.rect, currentAxleConPointState)
    );
  }, [rectSettings, currentAxleConPointState]);

  const [shouldSubmitAfterRange, setShouldSubmitAfterRange] = useState(false);

  const handleRangeChange = () => {
    const newState: RectSettingsStateType = structuredClone(rectSettings);
    const axis = currentAxleConPointState;
    const [min, max] = conPointMovementDiapason;

    const newCoord = min + (max - min) * sliderPosition;

    if (axis === "X") {
      newState.conPoint.point.x = newCoord;
    } else if (axis === "Y") {
      newState.conPoint.point.y = newCoord;
    }

    onChange(rectIdentificator, newState);
    setShouldSubmitAfterRange(true);
  };

  useEffect(() => {
    if (shouldSubmitAfterRange) {
      onRangeChangeComplete();
      setShouldSubmitAfterRange(false);
    }
  }, [shouldSubmitAfterRange, onRangeChangeComplete]);

  useEffect(() => {
    if (rangeClicked) return;
    const [min, max] = conPointMovementDiapason;
    const axis = currentAxleConPointState;
    const coord =
      axis === "X"
        ? rectSettings.conPoint.point.x
        : rectSettings.conPoint.point.y;
    const relative = (coord - min) / (max - min);
    setSliderPosition(relative);
  }, [
    rangeClicked,
    rectSettings,
    conPointMovementDiapason,
    currentAxleConPointState,
    sliderPosition,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = Number(value);

    const newState: RectSettingsStateType = structuredClone(rectSettings);
    const [, path] = name.split("!");
    set(newState, path, parsedValue);

    onChange(rectIdentificator, newState);
  };

  return (
    <fieldset>
      <legend>Прямоугольник{` ${rectIdentificator}`}</legend>
      <fieldset>
        <legend>Прямоугольник</legend>
        <div className="rectSettingsDiv">
          <div className="rectCenterDiv">
            <div className="labeledInput">
              <label>
                X:
                <input
                  onChange={handleInputChange}
                  name={`${rectIdentificator}!rect.position.x`}
                  type="number"
                  value={rectSettings.rect.position.x}
                ></input>
              </label>
            </div>
            <div className="labeledInput">
              <label>
                Y:
                <input
                  onChange={handleInputChange}
                  name={`${rectIdentificator}!rect.position.y`}
                  type="number"
                  value={rectSettings.rect.position.y}
                ></input>
              </label>
            </div>
          </div>
          <div className="rectSizeDiv">
            <div className="labeledInput">
              <label>
                Width:
                <input
                  onChange={handleInputChange}
                  name={`${rectIdentificator}!rect.size.width`}
                  type="number"
                  value={rectSettings.rect.size.width}
                ></input>
              </label>
            </div>
            <div className="labeledInput">
              <label>
                Height:
                <input
                  onChange={handleInputChange}
                  name={`${rectIdentificator}!rect.size.height`}
                  type="number"
                  value={rectSettings.rect.size.height}
                ></input>
              </label>
            </div>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Точка присоединения</legend>
        <div>
          <div className="conPointSettingsDiv">
            <div className="conPointCoordsDiv">
              <div className="labeledInput">
                <label>
                  X:
                  <input
                    onChange={handleInputChange}
                    name={`${rectIdentificator}!conPoint.point.x`}
                    type="number"
                    value={rectSettings.conPoint.point.x}
                  ></input>
                </label>
              </div>
              <div className="labeledInput">
                <label>
                  Y:
                  <input
                    onChange={handleInputChange}
                    name={`${rectIdentificator}!conPoint.point.y`}
                    type="number"
                    value={rectSettings.conPoint.point.y}
                  ></input>
                </label>
              </div>
            </div>
            <div className="conPointAngleDiv">
              <div className="labeledInput">
                <label className="selectLabel">
                  Угол:
                  <select
                    onChange={handleInputChange}
                    name={`${rectIdentificator}!conPoint.angle`}
                    value={rectSettings.conPoint.angle}
                  >
                    <option value="0">0</option>
                    <option value="90">90</option>
                    <option value="180">180</option>
                    <option value="270">270</option>
                  </select>
                </label>
              </div>
              <div className="conPointAngleRangeDiv">
                <div className="labeledInput">
                  <label>
                    Положение точки на грани:
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={sliderPosition}
                      onPointerDown={() => setRangeClicked(true)}
                      onPointerUp={() => setRangeClicked(false)}
                      onChange={(e) => {
                        if (rangeClicked) {
                          const newPosition = Number(e.target.value);
                          setSliderPosition(newPosition);
                          handleRangeChange();
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>
    </fieldset>
  );
};

export default SettingsForm;
