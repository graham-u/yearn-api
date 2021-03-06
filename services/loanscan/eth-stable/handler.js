'use strict';

const dynamodb = require('../../../utils/dynamoDb');
const _ = require('lodash');

const db = dynamodb.doc;

module.exports.handler = async () => {
  const params = {
    TableName: 'vaultApy',
  };
  const entries = await db.scan(params).promise();
  const items = entries.Items;

  const getLoanScanFormat = (item) => {
    const { apyOneMonthSample, symbol: tokenSymbol } = item;
    const apy = apyOneMonthSample / 100;
    const apr = apy;
    const loanScanData = { apy, apr, tokenSymbol };
    return loanScanData;
  };

  const lendRates = _.map(items, getLoanScanFormat);

  const filteredLendRates = _.filter(lendRates, (vault) => {
    return (
      vault.tokenSymbol === 'USDT' ||
      vault.tokenSymbol === 'USDC' ||
      vault.tokenSymbol === 'TUSD' ||
      vault.tokenSymbol === 'DAI' ||
      vault.tokenSymbol === 'WETH'
    );
  });

  const fixedLendRates = filteredLendRates.map((rate) => {
    if (rate.tokenSymbol === 'WETH') {
      rate.tokenSymbol = 'ETH';
    }
    return rate;
  });

  const loanScanResponse = {
    lendRates: fixedLendRates,
  };

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(loanScanResponse),
  };
  return response;
};
