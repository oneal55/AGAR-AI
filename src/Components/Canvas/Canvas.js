import Population from "../../NEATJS/population.js";
import { useState, useEffect, useRef } from "react";
import "./Canvas.css";

const Canvas = (props) => {
  const [popSize, setPopSize] = useState(10);
  const [timeToStop, setTimeToStop] = useState(15);
  const [population, setPopulation] = useState(new Population(popSize));
  const [predationScale, setPredationScale] = useState(1);
  const [lifeSpanScale, setLifeSpanScale] = useState(1);
  const [tickRate, setTickRate] = useState(34);
  const timer = useRef();

  const nextGen = () => {
    let popClone = population.clone();
    popClone.finishGen(timeToStop * tickRate);
    setPopulation(popClone);
  };

  const reset = () => {
    console.log("Predation: " + predationScale);
    console.log("Survival: " + lifeSpanScale);
    setPopulation(new Population(popSize));
  };

  const handleTimer = (event) => {
    if (event.nativeEvent.type === "click") {
      setTimeToStop(timer.current.value);
    }

    if (
      event.nativeEvent.type === "keydown" &&
      event.nativeEvent.code === "Enter"
    ) {
      setTimeToStop(timer.current.value);
    }
  };

  const handlePopSize = (event) => {
    setPopSize(event.nativeEvent.target.value);
    if (
      event.nativeEvent.type === "keydown" &&
      event.nativeEvent.code === "Enter"
    ) {
      reset();
    }
  };

  const handlePredation = (event) => {
    setPredationScale(event.nativeEvent.target.value);
    if (
      event.nativeEvent.type === "keydown" &&
      event.nativeEvent.code === "Enter"
    ) {
      reset();
    }
  };

  const handleSurvival = (event) => {
    setLifeSpanScale(event.nativeEvent.target.value);
    if (
      event.nativeEvent.type === "keydown" &&
      event.nativeEvent.code === "Enter"
    ) {
      reset();
    }
  };

  useEffect(() => {
    const tickInterval = setInterval(() => {
      const c = document.getElementById("theGame");
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);

      let popClone = population.clone();
      popClone.updateAlive();
      if (popClone.done(timeToStop * tickRate)) {
        popClone.naturalSelection(predationScale, lifeSpanScale);
      }
      popClone.draw();
      setPopulation(popClone);

      //    population.draw();
    }, tickRate);

    return () => {
      clearInterval(tickInterval);
    };
  }, [population]);

  return (
    <div style={{ background: "#282c34" }}>
      <h1 className="whiteTxt">Agar AI</h1>
      <h2 className="txt whiteTxt title">
        Generation: {population.generation}
      </h2>
      <div className="Holder">
        <div className="gameContainer">
          <canvas id="theGame" width="650px" height="400px" />
        </div>
        <div className="buttons">
          <div className="row">
            <button className="btnDiv blue" onClick={nextGen}>
              NextGen
            </button>
            <button className="btnDiv red" onClick={reset}>
              Reset
            </button>
          </div>

          <div className="row">
            <button className="btnDiv green" onClick={handleTimer}>
              Duration(seconds)
            </button>
            <input
              type="number"
              className="btnDiv blackTxt"
              onKeyDown={handleTimer}
              ref={timer}
            />
          </div>

          <div className="row">
            <button className="btnDiv green" onClick={reset}>
              Set Pop. Size
            </button>
            <input
              type="number"
              className="btnDiv blackTxt"
              onChange={handlePopSize}
              onKeyDown={handlePopSize}
            />
          </div>

          <div className="row">
            <button className="btnDiv green" onClick={reset}>
              Predation Modifier
            </button>
            <input
              type="number"
              min={0}
              className="btnDiv blackTxt"
              onChange={handlePredation}
              onKeyDown={handlePredation}
            />
          </div>

          <div className="row">
            <button className="btnDiv green" onClick={reset}>
              Survival Modifier
            </button>
            <input
              type="number"
              min={0}
              className="btnDiv blackTxt"
              onChange={handleSurvival}
              onKeyDown={handleSurvival}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
