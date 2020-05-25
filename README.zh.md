# vue-cli-plugin-route-generator

基于Nuxtjs源码，分离出的一个vue路由自动生成插件。

[English](./README.md)

## 安装

### yarn

```bash
yarn add vue-cli-plugin-route-generator
```
### npm

```bash
npm install -D vue-cli-plugin-route-generator
```

## 用法

在安装完插件之后，在`views`下的文件或者文件夹改动，将会自动对应生成路由`routes.js`。

### 例子

views文件夹内:

- 基础路由:

```
views/
--| user/
-----| index.vue
-----| one.vue
--| index.vue
```

将生成如下:
```javascript
router: {
  routes: [
    {
      name: 'index',
      path: '/',
      component: 'views/index.vue'
    },
    {
      name: 'user',
      path: '/user',
      component: 'views/user/index.vue'
    },
    {
      name: 'user-one',
      path: '/user/one',
      component: 'views/user/one.vue'
    }
  ]
}
```

- 动态路由

```
views/
--| _slug/
-----| comments.vue
-----| index.vue
--| users/
-----| _id.vue
--| index.vue
```

将生成如下:

```javascript
router: {
  routes: [
    {
      name: 'index',
      path: '/',
      component: 'views/index.vue'
    },
    {
      name: 'users-id',
      path: '/users/:id?',
      component: 'views/users/_id.vue'
    },
    {
      name: 'slug',
      path: '/:slug',
      component: 'views/_slug/index.vue'
    },
    {
      name: 'slug-comments',
      path: '/:slug/comments',
      component: 'views/_slug/comments.vue'
    }
  ]
}
```

- 嵌套路由

```
views/
--| users/
-----| _id.vue
-----| index.vue
--| users.vue
```

将生成如下:
```javascript
router: {
  routes: [
    {
      path: '/users',
      component: 'views/users.vue',
      children: [
        {
          path: '',
          component: 'views/users/index.vue',
          name: 'users'
        },
        {
          path: ':id',
          component: 'views/users/_id.vue',
          name: 'users-id'
        }
      ]
    }
  ]
}
```
- 动态嵌套路由

```
views/
--| _category/
-----| _subCategory/
--------| _id.vue
--------| index.vue
-----| _subCategory.vue
-----| index.vue
--| _category.vue
--| index.vue
```

将生成如下:
```javascript
router: {
  routes: [
    {
      path: '/',
      component: 'views/index.vue',
      name: 'index'
    },
    {
      path: '/:category',
      component: 'views/_category.vue',
      children: [
        {
          path: '',
          component: 'views/_category/index.vue',
          name: 'category'
        },
        {
          path: ':subCategory',
          component: 'views/_category/_subCategory.vue',
          children: [
            {
              path: '',
              component: 'views/_category/_subCategory/index.vue',
              name: 'category-subCategory'
            },
            {
              path: ':id',
              component: 'views/_category/_subCategory/_id.vue',
              name: 'category-subCategory-id'
            }
          ]
        }
      ]
    }
  ]
}
```

👉 [更多](https://nuxtjs.org/guide/routing)