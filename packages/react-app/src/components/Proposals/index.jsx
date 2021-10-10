import { gql, useQuery } from "@apollo/client";
import { Card, Col, Input, Layout, Row, Skeleton, Space, Statistic, Typography } from "antd";
import { useContractReader } from "eth-hooks";
import { utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import useApi from "react-use-api";
import Proposal from "./Proposal";
const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Search } = Input;

export default function Proposals({ address, mainnetProvider, localProvider, tx, readContracts, writeContracts }) {
  const stakeTokenSymbol = useContractReader(readContracts, "OsmoticFunding", "stakeTokenSymbol");
  const requestTokenSymbol = useContractReader(readContracts, "OsmoticFunding", "requestTokenSymbol");
  const totalStaked = useContractReader(readContracts, "OsmoticFunding", "totalStaked");
  const _availableFunds = useContractReader(readContracts, "OsmoticFunding", "availableFunds");
  const availableFunds = _availableFunds && utils.formatUnits(_availableFunds.toString(), 18);
  const proposalsRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState();
  const [searchedProposals] = useApi(
    `https://jsonp.afeld.me/?url=https://gitcoin.co/api/v0.1/grants/?keyword=${searchTerm ?? "1hive"}`,
  );

  const query = gql`
    {
      proposals(first: 25, orderBy: createdAt, orderDirection: desc) {
        id
        link
        beneficiary {
          id
        }
      }
    }
  `;
  const { loading, data } = useQuery(query, { pollInterval: 2500 });
  // const addedProposals = data?.proposals.map(p => p.link.match(/gitcoin.co\/grants\/(\d+)/));
  const addedProposals = [899, 2388, 795, 277, 539, 1141, 191];
  const proposals = searchedProposals
    ?.filter(p => p.active && p.id !== 900)
    .map(p => ({ ...p, index: addedProposals.lastIndexOf(p.id) }));
  useEffect(() => {
    if (searchTerm) {
      proposalsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [proposals]);

  return (
    <div style={{ margin: 40 }}>
      <Row style={{ alignItems: "center" }} justify="center" gutter={10}>
        <Col span={12}>
          <Space size="large" direction="vertical">
            <Row align="center">
              <Title level={2}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: `<b>Osmotic Funding</b> is a protocol built on top of <strong>Superfluid Finance</strong> and
                  <b>Conviction Voting</b> to create and regulate project funding streams based on the amount of interest a
                  community has on them.`,
                  }}
                />
              </Title>
            </Row>
            <Row type="flex" align="center">
              <Search placeholder="Search Gitcoin Grant" onSearch={setSearchTerm} size="large" />
            </Row>
            <Row>
              <Col span={12}>
                <Statistic amount={availableFunds} suffix={requestTokenSymbol} title="available funds" />
              </Col>
              <Col span={12}>
                <Statistic amount={totalStaked} suffix={stakeTokenSymbol} title="total staked" />
              </Col>
            </Row>
          </Space>
        </Col>
        <Col span={12}>
          <img
            height="600px"
            style={{ objectFit: "cover", maxWidth: "100%", objectPosition: "left" }}
            src="stele.png"
          />
        </Col>
      </Row>
      <div ref={proposalsRef} style={{ marginTop: 40 }}>
        <Row gutter={[50, 30]}>
          {proposals ? (
            proposals.map(proposal => (
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Proposal proposal={proposal} tx={tx} readContracts={readContracts} writeContracts={writeContracts} />
              </Col>
            ))
          ) : (
            <>
              {Array.from({ length: 20 }, (_, i) => (
                <Col xs={24} lg={12} xl={8} xxl={6}>
                  <Card>
                    <Skeleton />
                  </Card>
                </Col>
              ))}
            </>
          )}
        </Row>
      </div>
    </div>
  );
}
