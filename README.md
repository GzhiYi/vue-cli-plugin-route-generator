# vue-cli-plugin-route-generator

Based on Nuxtjs source code, a custom plug-in for generating routes is separated.

## Install

### Using yarn

```bash
yarn add vue-cli-plugin-route-generator
```
### Using npm

```bash
npm install -D vue-cli-plugin-route-generator
```

## Usage

After installing this plugin, changes to files or folders under `views` will automatically regenerate `routes.js`.

### Example

In views:

- Basic Routes:

```
views/
--| user/
-----| index.vue
-----| one.vue
--| index.vue
```

will generate into:
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

- Dynamic Routes

```
views/
--| _slug/
-----| comments.vue
-----| index.vue
--| users/
-----| _id.vue
--| index.vue
```

will generate into:
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

- Nested Routes

```
views/
--| users/
-----| _id.vue
-----| index.vue
--| users.vue
```

will generate into:
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
- Dynamic Nested Routes

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

will generate into:
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

👉 [view more](https://nuxtjs.org/guide/routing)