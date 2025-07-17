import { useEffect, useState } from "react";
import "./App.css";
import type {
  ConnectionPoint,
  Point,
  preparedConfigKeys,
  Rect,
} from "./types/commonTypes";
import { createRect } from "./geometry/utils";
import { dataConverter } from "./geometry/dataConverter";
import CanvasMap, { type CanvasMapUpdate } from "./components/CanvasMap";
import SettingsForm, {
  type SettingsFormProps,
} from "./components/SettingsForm";
import { PREPARED_CONFIGS } from "./types/constatnts";

export type AppStateType = {
  rectA: Rect;
  rectB: Rect;
  conPointA: ConnectionPoint;
  conPointB: ConnectionPoint;
};

function App() {
  const [appState, setAppState] = useState<AppStateType>({
    rectA: createRect(100, 100, 100, 100),
    rectB: createRect(225, 75, 50, 50),
    conPointA: { angle: 0, point: { x: 150, y: 120 } },
    conPointB: { angle: 90, point: { x: 220, y: 100 } },
  });

  const [errorState, setErrorState] = useState<string | null>(null);
  const [pathState, setPathState] = useState<Point[]>([]);

  useEffect(() => {
    if (errorState) {
      setPathState([]);
    }
  }, [errorState]);

  useEffect(() => {
    try {
      const path = dataConverter(
        appState.rectA,
        appState.rectB,
        appState.conPointA,
        appState.conPointB
      );
      setPathState(path);
    } catch (error) {
      if (error instanceof Error) {
        setErrorState(error.message);
      } else {
        setErrorState("Произошла неизвестная ошибка");
      }
    }
  }, [appState]);

  const handleRectMove = (partialState: CanvasMapUpdate) => {
    setAppState((prev) => {
      const prevClone = structuredClone(prev);
      if ("rectA" in partialState) {
        return {
          ...prevClone,
          rectA: partialState.rectA,
          conPointA: {
            ...prevClone.conPointA,
            ...partialState.conPointA,
          },
        };
      } else {
        return {
          ...prevClone,
          rectB: partialState.rectB,
          conPointB: {
            ...prevClone.conPointB,
            ...partialState.conPointB,
          },
        };
      }
    });

    setErrorState(null);
  };

  const canvasRects: Rect[] = [appState.rectA, appState.rectB];

  const settingsFormPropsObj: SettingsFormProps = {
    rectA: appState.rectA,
    rectB: appState.rectB,
    conPointA: appState.conPointA,
    conPointB: appState.conPointB,
    onSubmit: (newState: AppStateType) => {
      setAppState(newState);
      setErrorState(null);
    },
  };

  const [currentPrepareConfig, setCurrentPrepareConfig] =
    useState<preparedConfigKeys>("1");

  useEffect(() => {
    setAppState(PREPARED_CONFIGS[currentPrepareConfig]);
  }, [currentPrepareConfig]);

  return (
    <>
      <div className="wrapper">
        <div className="workField">
          <div className="sidebar">
            <SettingsForm {...settingsFormPropsObj} />
            <div className="preparedConfig">
              <label className="selectLabel">
                Готовые конфигурации:
                <select
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setCurrentPrepareConfig(
                      e.target.value as preparedConfigKeys
                    )
                  }
                  value={currentPrepareConfig}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </label>
            </div>
            <div className="pathDiv">
              <span>
                Путь: {pathState.map((p) => `x: ${p.x}, y: ${p.y}`).join("; ")}
              </span>
            </div>
          </div>
          <CanvasMap
            rects={canvasRects}
            path={pathState ?? [{ x: 0, y: 0 }]}
            startPoint={appState.conPointA.point}
            endPoint={appState.conPointB.point}
            onRectMove={handleRectMove}
          />
        </div>
        <div className="errorDiv">
          {ErrorEvent ? (
            <>
              <p className="errorMessage">{errorState}</p>{" "}
            </>
          ) : null}
        </div>
        <div className="footer">
          Логинов И.В.{" "}
          <a
            target="_blank"
            href="https://github.com/ArchibaldKronin"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </>
  );
}

export default App;
