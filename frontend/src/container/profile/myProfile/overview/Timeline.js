'use client';

import React from 'react';
import { Row, Col, Skeleton } from 'antd';
import { useSelector } from 'react-redux';
import { Cards } from '../../../../components/cards/frame/cards-frame';

// Direct imports - no lazy loading needed
import RightAside from './RightAside';
import CreatePost from './timeline/CreatePost';
import AllPosts from './timeline/Posts';

function Timeline() {
  const { posts } = useSelector((state) => {
    return {
      posts: state.Profile.posts,
    };
  });
  return (
    <Row gutter={25}>
      <Col md={16}>
        <CreatePost />
        {posts
          .sort((a, b) => b.time - a.time)
          .map((post) => {
            return <AllPosts key={post.postId} {...post} />;
          })}
      </Col>
      <Col md={8}>
        <RightAside />
      </Col>
    </Row>
  );
}

export default Timeline;
