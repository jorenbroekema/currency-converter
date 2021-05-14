import { css } from 'lit';

export default css`
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    padding: 0 20px;
    max-width: 600px;
    margin: 0 auto;
  }

  #input-date {
    display: flex;
    flex-direction: column;
    width: 200px;
    text-align: center;
    margin: 10px auto;
  }

  #input-date input {
    margin-top: 2px;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
  }

  select,
  input {
    padding: 5px;
    margin-bottom: 5px;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
  }

  .btn-group button {
    padding: 7px;
    background-color: lightgreen;
    border: none;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    margin: 10px 0px;
    font-weight: 700;
    font-size: 16px;
    font-family: 'Roboto Slab', sans-serif;
  }

  #convert-back-btn {
    background-color: lightblue;
  }

  #add-conversion-btn {
    background-color: lightgoldenrodyellow;
  }

  #remove-conversion-btn {
    background-color: lightcoral;
  }

  .source,
  .target {
    display: flex;
    flex-direction: column;
  }

  .source label,
  .target label {
    display: flex;
    flex-direction: column;
  }

  label input[type='text'],
  label select {
    width: 125px;
    box-sizing: border-box;
  }

  .wrapper {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  @media (min-width: 400px) {
    label input[type='text'],
    label select {
      width: 170px;
    }
  }

  @media (min-width: 600px) {
    .btn-group {
      flex-direction: row;
      justify-content: space-between;
    }

    label input[type='text'],
    label select {
      width: 250px;
    }
  }
`;
